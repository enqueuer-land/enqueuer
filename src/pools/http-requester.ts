import request from 'request';
import {Logger} from '../loggers/logger';
import {JavascriptObjectNotation} from '../object-notations/javascript-object-notation';

export class HttpRequester {
    private url: string;
    private method: string;
    private headers: any;
    private body: any;
    private timeout: number;

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
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
            request(options,
                (error: any, response: any) => {
                    if (error) {
                        reject('Http request error: '  + error);
                    } else {
                        resolve(response);
                    }
                });
        });
    }

    private createOptions() {
        let options: any = {
            url: this.url,
            method: this.method,
            timeout: this.timeout,
            headers: this.headers
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
            new JavascriptObjectNotation().parse(this.body);
            return this.body;
        }
        catch (exc) {
            //do nothing
        }
        if (typeof(this.body) != 'string') {
            this.body = new JavascriptObjectNotation().stringify(this.body);
        }

        return this.body;
    }
}
