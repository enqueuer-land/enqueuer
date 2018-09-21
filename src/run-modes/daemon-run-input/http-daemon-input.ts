import {Injectable} from 'conditional-injector';
import {Logger} from '../../loggers/logger';
import {DaemonInput} from './daemon-input';
import {HttpContainerPool} from '../../pools/http-container-pool';
import {DaemonInputRequisition} from './daemon-input-requisition';
import {JavascriptObjectNotation} from '../../object-notations/javascript-object-notation';

@Injectable({predicate: (daemonInput: any) => daemonInput.type === 'http-server'})
export class HttpDaemonInput extends DaemonInput {
    private port: number;
    private endpoint: string;
    private method: string;
    private type: string;

    public constructor(daemonInput: any) {
        super();

        this.type = daemonInput.type;
        this.port = daemonInput.port || 23023;
        this.endpoint = daemonInput.endpoint || '/requisitions';
        this.method = daemonInput.method || 'post';
    }

    public subscribe(onMessageReceived: (requisition: DaemonInputRequisition) => void): void {
        HttpContainerPool.getApp(this.port)
            .then((app: any) => {
                Logger.info(`Waiting for HTTP requisitions: (${this.method.toUpperCase()}) - http://localhost:${this.port}${this.endpoint}`);
                app[this.method](this.endpoint, (request: any, responseHandler: any) => {
                    Logger.debug(`HttpDaemonInput:${this.port} got message (${this.method}) ${this.endpoint}: ${request.rawBody}`);
                    let result: DaemonInputRequisition = {
                        type: this.type,
                        daemon: this,
                        input: request.rawBody,
                        responseHandler: responseHandler
                    };
                    onMessageReceived(result);
                });
            }).catch(err => {
                const message = `Error in HttpDaemonInput subscription: ${err}`;
                Logger.error(message);
                throw message;
        });
    }

    public unsubscribe(): Promise<void> {
        return HttpContainerPool.releaseApp(this.port);
    }

    public cleanUp(requisition: DaemonInputRequisition): Promise<void> {
        return Promise.resolve();
    }

    public sendResponse(message: DaemonInputRequisition): Promise<void> {
        const response = {
            status: 200,
            payload: message.output
        };

        Logger.trace(`${this.type} sending requisition response: ${new JavascriptObjectNotation().stringify(response)}`);
        try {
            message.responseHandler.status(response.status).send(response.payload);
            Logger.debug(`${this.type} requisition response sent`);
            return Promise.resolve();
        } catch (err) {
            return Promise.reject(`${this.type} response back sending error: ${err}`);
        }
    }

}
