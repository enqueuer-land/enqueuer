import { Logger } from '../loggers/logger';
import https from 'https';

const DEFAULT_TIMEOUT = 5000;

export class HttpPublisherFetcher {
  private readonly url: string;
  private readonly method: string;
  private readonly headers: any;
  private readonly timeout: number;
  private body: any;

  constructor(url: string, method: string, headers: any = {}, body: any, timeout: number = DEFAULT_TIMEOUT) {
    this.url = url;
    this.method = method;
    this.headers = headers;
    this.body = body;
    this.timeout = timeout;
  }

  public async request(): Promise<any> {
    Logger.info(`Hitting (${this.method.toUpperCase()}) - ${this.url}`);
    const options = this.createOptions();
    try {
      const response = await fetch(this.url, options);
      const headers: any = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      const result = {
        status: response.status,
        statusCode: response.status,
        body: await response.text(),
        headers: headers
      };
      return result;
    } catch (err) {
      const error = err as Error;
      //@ts-expect-error
      throw `Http request error: ${err}: ${error?.cause ?? error?.message}`;
    }
  }

  private createOptions(): RequestInit {
    const payload = this.handleObjectPayload();
    const headers: any = {};
    if (this.method.toUpperCase() != 'GET') {
      headers['Content-Length'] = this.setContentLength(payload);
    }
    const newLocal = {
      method: this.method,
      signal: AbortSignal.timeout(this.timeout),
      headers: {
        ...headers,
        ...this.headers
      },
      body: payload,
      agent: new https.Agent({
        keepAlive: true,
        maxSockets: Infinity,
        keepAliveMsecs: 20000
      })
    };
    return newLocal;
  }

  private setContentLength(value: string = ''): number {
    if (Buffer.isBuffer(value)) {
      return value.length;
    } else {
      return Buffer.from(value, 'utf8').byteLength;
    }
  }

  private handleObjectPayload(): string | undefined {
    if (this.method.toUpperCase() == 'GET') {
      return undefined;
    }
    try {
      JSON.parse(this.body);
      return this.body;
    } catch (exc) {
      //do nothing
    }
    if (typeof this.body != 'string') {
      this.body = JSON.stringify(this.body);
    }

    return this.body;
  }
}
