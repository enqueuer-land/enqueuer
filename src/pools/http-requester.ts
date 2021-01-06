import request from 'request';
import {Logger} from '../loggers/logger';

export class HttpRequester {
    private readonly url: string;
    private readonly method: string;
    private readonly headers: any;
    private readonly timeout: number;
    private body: any;

    constructor(url: string, method: string, headers: any = {}, body: any, timeout: number = 3000) {
        this.url = url;
        this.method = method;
        this.headers = headers;
        this.body = body;
        this.timeout = timeout;
    }

    public request(): Promise<any> {
        return new Promise((resolve, reject) => {
            Logger.info(`Hitting (${this.method.toUpperCase()}) - ${this.url}`);
            const options = this.createOptions();
            request(options,
                (error: any, response: any) => {
                    if (error) {
                        reject('Http request error: ' + error);
                    } else {
                        //Needed because, for some reason, response.headers was not being shown as response key.
                        //Therefore, the test http-more-examples.yml was failing
                        const newResponse = Object.entries(response)
                            .reduce((acc: any, [key, value]) => {
                                acc[key] = value;
                                return acc;
                            }, {});
                        newResponse.headers = response.headers;
                        resolve(newResponse);
                    }
                });
        });
    }

    private createOptions() {
        const options: any = {
            url: this.url,
            method: this.method,
            timeout: this.timeout,
            headers: this.headers,
            rejectUnauthorized: false
        };
        options.data = options.body = this.handleObjectPayload();
        if (this.method.toUpperCase() != 'GET') {
            options.headers['Content-Length'] = options.headers['Content-Length'] || this.setContentLength(options.data);
        }
        return options;
    }

    private setContentLength(value: string): number {
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
        if (typeof (this.body) != 'string') {
            this.body = JSON.stringify(this.body);
        }

        return this.body;
    }
}
