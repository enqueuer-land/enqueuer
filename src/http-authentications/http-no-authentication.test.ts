import {HttpNoAuthentication} from './http-no-authentication';
import {Injectable} from "conditional-injector";

jest.mock('conditional-injector');

describe('HttpNoAuthentication', () => {

    it('should inject properly', () => {
        Injectable.mockImplementation();
        expect(Injectable).toHaveBeenCalledWith();
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