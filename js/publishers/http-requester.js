"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = __importDefault(require("request"));
class HttpRequester {
    constructor(url, method, headers = {}, body) {
        this.url = url;
        this.method = method;
        this.headers = headers;
        this.body = body;
    }
    request() {
        return new Promise((resolve, reject) => {
            const options = this.createOptions();
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
            request_1.default(options, (error, response) => {
                if (error) {
                    reject('Http request error: ' + error);
                }
                else {
                    resolve(response);
                }
            });
        });
    }
    createOptions() {
        let options = {
            url: this.url,
            method: this.method,
            headers: this.headers
        };
        options.data = options.body = this.handleObjectPayload();
        if (this.method.toUpperCase() != 'GET') {
            options.headers['Content-Length'] = options.headers['Content-Length'] || this.setContentLength(options.data);
        }
        return options;
    }
    setContentLength(value) {
        if (Buffer.isBuffer(value)) {
            return value.length;
        }
        else {
            return Buffer.from(value, 'utf8').byteLength;
        }
    }
    handleObjectPayload() {
        if (this.method.toUpperCase() == 'GET') {
            return undefined;
        }
        try {
            JSON.parse(this.body);
            return this.body;
        }
        catch (exc) {
            //do nothing
        }
        if (typeof (this.body) != 'string') {
            this.body = JSON.stringify(this.body);
        }
        return this.body;
    }
}
exports.HttpRequester = HttpRequester;
