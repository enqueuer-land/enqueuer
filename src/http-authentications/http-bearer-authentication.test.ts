import {HttpBearerAuthentication} from './http-bearer-authentication';
import {Injectable} from "conditional-injector";

jest.mock('conditional-injector');

describe('HttpBearerAuthentication', () => {

    const BEARER_TOKEN = 'Bearer dXNlcjpwYXNzd29yZA';

    const DEFAULT_AUTH = {
        bearer: {
            token: 'dXNlcjpwYXNzd29yZA'
        }
    };

    it('should inject properly', () => {
        Injectable.mockImplementation();
        expect(Injectable).toBeCalled();
        const mockCalls = Injectable.mock.calls;
        expect(mockCalls.length).toBe(1);
        const injectableOption = mockCalls[0][0];
        expect(injectableOption.predicate({bearer: { token: 'value' }})).toBeTruthy();
        expect(injectableOption.predicate({bearer: 'value'})).toBeFalsy();
        expect(injectableOption.predicate({unknown: 'value'})).toBeFalsy();
    });

    it('tests number', () => {
        const authorization: HttpBearerAuthentication = new HttpBearerAuthentication(DEFAULT_AUTH);
        const verify = authorization.verify(BEARER_TOKEN);

        expect(verify.length).toBe(3);
    });

    it('Verify token', () => {
        const authorization: HttpBearerAuthentication = new HttpBearerAuthentication(DEFAULT_AUTH);

        const verify = authorization.verify(BEARER_TOKEN);

        expect(verify.every((test) => test.valid)).toBeTruthy();
    });

    it('Verify token unmatch', () => {
        const authorization: HttpBearerAuthentication = new HttpBearerAuthentication(DEFAULT_AUTH);

        const verify = authorization.verify('Bearer tokenUnmatch');
        const bearerTokenTest = verify.filter((test) => test.name ==  '"Bearer" authentication token')[0];

        expect(bearerTokenTest.valid).toBeFalsy();
    });

    it('No Bearer prefix', () => {
        const authorization: HttpBearerAuthentication = new HttpBearerAuthentication(DEFAULT_AUTH);

        const verify = authorization.verify('WrongPrefix dXNlcjpwYXNzd29yZA');

        expect(verify.filter((test) => !test.valid)[0].name).toBe('"Bearer" authentication prefix');
    });

    it('Generate authorization based on token', () => {
        const bearer: HttpBearerAuthentication = new HttpBearerAuthentication(DEFAULT_AUTH);

        const value: any = bearer.generate();

        expect(value.authorization).toBe(BEARER_TOKEN);
    });

    it('Empty authentication is falsy', () => {
        const authorization: HttpBearerAuthentication = new HttpBearerAuthentication(DEFAULT_AUTH);

        const verify = authorization.verify();

        expect(verify.valid).toBeFalsy();
    });
});