import { Sensor } from './sensor';
import { Logger } from '../loggers/logger';
import { SensorModel } from '../models/inputs/sensor-model';
import { HttpContainerPool } from '../pools/http-container-pool';
import { TestModel } from '../models/outputs/test-model';
import { HttpActuatorFetcher } from '../pools/http-actuator-fetcher';
import { MainInstance } from '../plugins/main-instance';
import { SensorProtocol } from '../protocols/sensor-protocol';
import { HttpAuthenticationFactory } from '../http-authentications/http-authentication-factory';
import * as core from 'express-serve-static-core';

const DEFAULT_TIMEOUT = 5000;

class HttpSensor extends Sensor {
  private readonly proxy: boolean;
  private responseToClientHandler?: any;
  private expressApp?: core.Express | any;

  constructor(sensorAttributes: SensorModel) {
    super(sensorAttributes);

    this.type = this.type.toLowerCase();
    this.proxy = this.isProxyServer();
    this['method'] = sensorAttributes.method || 'get';
    this['method'] = this.method.toLowerCase();
  }

  public async mount(): Promise<void> {
    try {
      const app = await HttpContainerPool.getApp(this.port, this.credentials);
      this.expressApp = app;
      this.expressApp.keepAliveTimeout = 60 * 1000 + 1000;
      this.expressApp.headersTimeout = 60 * 1000 + 2000;
    } catch (err) {
      const message = `Error in [${this.type}] ${this.name} sensor: ${err}`;
      Logger.error(message);
      throw err;
    }
  }

  public unmount(): Promise<void> {
    return HttpContainerPool.releaseApp(this.port);
  }

  public respond(): Promise<void> {
    Logger.trace(`${this.type} sending response: ${JSON.stringify(this.response)}`);
    try {
      Object.keys(this.response.headers || {}).forEach(key => {
        this.responseToClientHandler.header(key, this.response.headers[key]);
      });
      const body = typeof this.response.payload === 'number' ? '' + this.response.payload : this.response.payload;
      this.responseToClientHandler.status(this.response.status).send(body);
      Logger.debug(`${this.type} response sent`);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(`${this.type} response back sending error: ${err}`);
    }
  }

  public onMessageReceivedTests(messageReceived: any): TestModel[] {
    if (this.authentication && messageReceived) {
      Logger.debug(
        `${this.type} authenticating message with ${JSON.stringify(Object.keys(this.authentication), null, 2)}`
      );
      const verifier = new HttpAuthenticationFactory().create(this.authentication);
      return verifier.verify(messageReceived.headers.authorization);
    }
    return [];
  }

  public receiveMessage(): Promise<any> {
    if (this.proxy) {
      return this.proxyServerMessageReceiving();
    } else {
      return this.realServerMessageReceiving();
    }
  }

  private realServerMessageReceiving(): Promise<any> {
    return new Promise(resolve => {
      Logger.debug(`Listening to (${this.method.toUpperCase()}) ${this.port}:${this.endpoint}`);
      const realServerFunction = (request: any, responseHandler: any, next: any) => {
        Logger.debug(
          `${this.type.toUpperCase()}:${this.port} got hit (${this.method.toUpperCase()}) ${this.endpoint}: ${request.rawBody}`
        );
        if (this.responseToClientHandler) {
          next();
        }
        this.responseToClientHandler = responseHandler;
        this.onMessageReceivedTests(request);
        const receivedStructure = this.createMessageReceivedStructure(request);
        this.executeHookEvent('onMessageReceived', receivedStructure);
        resolve(this.processResponseToBePrinted(receivedStructure));
      };
      this.expressApp[this.method](this.endpoint, (request: any, responseHandler: any, next: any) =>
        realServerFunction(request, responseHandler, next)
      );
    });
  }

  private processResponseToBePrinted(response: any) {
    try {
      if (response.body) {
        response.body = JSON.parse(response.body);
      }
    } catch (e) {}
    return response;
  }

  private proxyServerMessageReceiving(): Promise<void> {
    return new Promise((resolve, reject) => {
      Logger.debug(`Listening to (${this.method})${this.port}${this.endpoint}/*`);
      const proxyNamedFunction = (originalRequest: any, responseHandler: any, next: any) => {
        this.responseToClientHandler = responseHandler;
        Logger.debug(`${this.type}:${this.port} got hit (${this.method}) ${this.endpoint}: ${originalRequest.rawBody}`);
        this.redirect.headers = originalRequest.headers;
        this.redirect.payload = originalRequest.rawBody;
        this.onMessageReceivedTests(originalRequest);
        this.executeHookEvent('onOriginalMessageReceived', this.createMessageReceivedStructure(originalRequest));

        this.redirectCall()
          .then((redirectionResponse: any) => {
            Logger.trace(
              `${this.type}:${this.port} got redirection response: ` + `${JSON.stringify(redirectionResponse, null, 2)}`
            );
            this.response = {
              status: redirectionResponse.statusCode,
              payload: redirectionResponse.body,
              headers: redirectionResponse.headers
            };
            this.executeHookEvent('onMessageReceived', redirectionResponse);
            resolve();
            next();
          })
          .catch(err => {
            reject(err);
            next();
          });
      };
      this.expressApp[this.method](this.endpoint, (request: any, responseHandler: any, next: any) =>
        proxyNamedFunction(request, responseHandler, next)
      );
    });
  }

  private createMessageReceivedStructure(message: any): any {
    return {
      headers: message.headers,
      params: message.params,
      query: message.query,
      url: message.url,
      body: message.rawBody
    };
  }

  private redirectCall(): Promise<void> {
    Logger.info(`Redirecting call from ${this.endpoint} (${this.port}) to ${this.url}`);
    return new HttpActuatorFetcher(
      this.redirect.url,
      this.redirect.method || 'get',
      this.redirect.headers,
      this.redirect.payload,
      this.redirect.timeout || DEFAULT_TIMEOUT
    ).request();
  }

  private isProxyServer(): boolean {
    if (this.type) {
      return this.type.indexOf('proxy') != -1;
    }
    throw `Http server type is not known: ${this.type}`;
  }
}

export function entryPoint(mainInstance: MainInstance): void {
  const protocol = new SensorProtocol('http', (sensorModel: SensorModel) => new HttpSensor(sensorModel), {
    description: 'The HTTP sensor provides implementations of http servers and proxies',
    libraryHomepage: 'https://expressjs.com/',
    schema: {
      attributes: {
        endpoint: {
          required: true,
          type: 'string',
          example: '/almighty/enqueuer'
        },
        method: {
          required: false,
          type: 'string',
          defaultValue: 'GET',
          listValues: ['GET', 'POST', 'PATCH', 'PUT', 'OPTIONS', 'HEAD', 'DELETE']
        },
        port: {
          required: true,
          type: 'int'
        },
        timeout: {
          required: false,
          type: 'int',
          defaultValue: DEFAULT_TIMEOUT,
          suffix: 'ms'
        },
        credentials: {
          required: false,
          description: 'Values used when being used as a secure server',
          type: {
            key: {
              required: true,
              type: 'string'
            },
            cert: {
              required: true,
              type: 'string'
            }
          }
        },
        redirect: {
          description: 'Values used when being used as a proxy sensor',
          type: {
            url: {
              required: true,
              type: 'string',
              example: 'https://github.com/enqueuer-land/enqueuer'
            },
            method: {
              required: false,
              type: 'string',
              defaultValue: 'GET',
              listValues: ['GET', 'POST', 'PATCH', 'PUT', 'OPTIONS', 'HEAD', 'DELETE']
            },
            timeout: {
              required: false,
              type: 'int',
              defaultValue: DEFAULT_TIMEOUT,
              suffix: 'ms'
            },
            headers: {
              description: '',
              type: 'object',
              defaultValue: {}
            }
          }
        },
        headers: {
          description: '',
          type: 'object',
          defaultValue: {}
        },
        response: {
          description: 'Response to be given when not being used as proxy',
          type: {
            status: {
              required: true,
              type: 'int'
            },
            payload: {
              required: true,
              type: 'any'
            }
          },
          defaultValue: {}
        }
      },
      hooks: {
        onMessageReceived: {
          description: '',
          arguments: {
            params: {},
            query: {},
            body: {},
            url: {}
          }
        },
        onOriginalMessageReceived: {
          description:
            'Useful when using a proxy sensor. ' +
            'Gets called when the proxy is hit, before actually proxying the message',
          arguments: {
            params: {},
            query: {},
            body: {},
            url: {}
          }
        }
      }
    }
  })
    .addAlternativeName('https', 'http-proxy', 'https-proxy', 'http-server', 'https-server')
    .setLibrary('fetch');

  mainInstance.protocolManager.addProtocol(protocol);
}
