import request from 'request';
import {HttpRequester} from "./http-requester";

jest.mock("request");

describe('HttpRequester', () => {

    it('Should resolve request result', async () => {
        const url = 'url';
        const method = 'method';
        const headers = {key: 'value'};
        const body = {
            body: true
        };
        const timeout = 100;
        const response = {body: 'body', headers: {headerA: 'a', 'header-1': 1}};

        const requestMock = jest.fn((options, cb) => {
            expect(options.url).toBe(url);
            expect(options.method).toBe(method);
            expect(options.timeout).toBe(timeout);
            cb(undefined, response);
        });
        // @ts-expect-error
        request.mockImplementationOnce(requestMock);
        const result = await new HttpRequester(url, method, headers, body, timeout).request()
        expect(result).toEqual(response);
    });

    it('Should reject request result', async () => {
        const requestMock = jest.fn((options, cb) => {
            expect(options.headers).toEqual({"Content-Length": 0});
            expect(options.timeout).toBe(3000);
            cb('error')
        });
        // @ts-expect-error
        request.mockImplementationOnce(requestMock);
        await expect(new HttpRequester('', '', undefined, '').request()).rejects.toBe("Http request error: error");
    });

});
