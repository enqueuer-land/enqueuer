import request from 'request';
import {HttpRequester} from "./http-requester";

jest.mock("request");

describe('HttpRequester', () => {

    it('Should resolve request result', done => {
        const url = 'url';
        const method = 'method';
        const headers = {key: 'value'};
        const body = {
            body: true
        };
        const timeout = 100;

        const requestMock = jest.fn((options, cb) => {
            expect(options.url).toBe(url);
            expect(options.method).toBe(method);
            expect(options.timeout).toBe(timeout);
            cb(undefined, 'response');
        });
        // @ts-expect-error
        request.mockImplementationOnce(requestMock);
        new HttpRequester(url, method, headers, body, timeout).request().then((result) => {
            expect(result).toBe('response');
            done();
        })
    });

    it('Should reject request result', done => {
        const requestMock = jest.fn((options, cb) => {
            expect(options.headers).toEqual({"Content-Length": 0});
            expect(options.timeout).toBe(3000);
            cb('error')
        });
        // @ts-expect-error
        request.mockImplementationOnce(requestMock);
        new HttpRequester('', '', undefined, '').request().catch((result) => {
            expect(result).toBe("Http request error: error");
            done();
        })
    });

});
