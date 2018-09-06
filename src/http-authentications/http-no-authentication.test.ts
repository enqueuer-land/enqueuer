import {HttpNoAuthentication} from './http-no-authentication';
import {Injectable} from "conditional-injector";

jest.mock('conditional-injector');
Injectable.mockImplementation();

describe('HttpNoAuthentication', () => {

    it('should inject properly', () => {
        expect(Injectable).toHaveBeenCalledWith();
        const mockCalls = Injectable.mock.calls;
        expect(mockCalls.length).toBe(1);
    });

    it('generate', () => {
        const no: HttpNoAuthentication = new HttpNoAuthentication({});

        const value: any = no.generate();

        expect(value).toBeNull();
    });

    it('verify', () => {
        const no: HttpNoAuthentication = new HttpNoAuthentication({});

        const value: any = no.verify(no.generate());

        expect(value.every(test => !test.valid)).toBeTruthy();
    });

});