import {HttpBasicAuthentication} from './http-basic-authentication';
import {Injectable} from "conditional-injector";

jest.mock('conditional-injector');

describe('HttpBasicAuthentication', () => {
    it('should inject properly', () => {
        Injectable.mockImplementation();
        expect(Injectable).toBeCalled();
        const mockCalls = Injectable.mock.calls;
        expect(mockCalls.length).toBe(1);
        const injectableOption = mockCalls[0][0];
        expect(injectableOption.predicate({basic: 'value'})).toBeTruthy();
        expect(injectableOption.predicate({unknown: 'value'})).toBeFalsy();
    });

    it('tests number', () => {
        const authentication = {
            basic: {
                user: 'user',
                password: 'password'
            }
        };
        const authorization: HttpBasicAuthentication = new HttpBasicAuthentication(authentication);
        const verify = authorization.verify('Basic dXNlcjpwYXNzd29yZA');

        expect(verify.length).toBe(4);
    });

    it('user:password', () => {
        const authentication = {
            basic: {
                user: 'user',
                password: 'password'
            }
        };
        const basic: HttpBasicAuthentication = new HttpBasicAuthentication(authentication);

        const value: any = basic.generate();

        expect(value.authorization).toBe('Basic dXNlcjpwYXNzd29yZA==');
    });

    it('Verify user:password', () => {
        const authentication = {
            basic: {
                user: 'user',
                password: 'password'
            }
        };
        const authorization: HttpBasicAuthentication = new HttpBasicAuthentication(authentication);

        const verify = authorization.verify('Basic dXNlcjpwYXNzd29yZA');

        expect(verify.every((test) => test.valid)).toBeTruthy();
    });


    it('No basic prefix', () => {
        const authentication = {
            basic: {
                user: 'user',
                password: 'password'
            }
        };
        const authorization: HttpBasicAuthentication = new HttpBasicAuthentication(authentication);

        const verify = authorization.verify('WrongPrefix dXNlcjpwYXNzd29yZA');

        expect(verify.filter((test) => !test.valid)[0].name).toBe('"Basic" authentication prefix');
    });


    it('alladin:OpenSesame', () => {
        const authentication = {
            basic: {
                user: 'Aladdin',
                password: 'OpenSesame'
            }
        };
        const basic: HttpBasicAuthentication = new HttpBasicAuthentication(authentication);

        const value: any = basic.generate();

        expect(value.authorization).toBe('Basic QWxhZGRpbjpPcGVuU2VzYW1l');
    });

    it('Verify alladin:OpenSesame', () => {
        const authentication = {
            basic: {
                user: 'Aladdin',
                password: 'OpenSesame'
            }
        };
        const authorization: HttpBasicAuthentication = new HttpBasicAuthentication(authentication);

        const verify = authorization.verify('Basic QWxhZGRpbjpPcGVuU2VzYW1l');

        expect(verify.every((test) => test.valid)).toBeTruthy();
    });

    it('Empty authentication is falsy', () => {
        const authentication = {
            basic: {
                user: 'Aladdin',
                password: 'OpenSesame'
            }
        };
        const authorization: HttpBasicAuthentication = new HttpBasicAuthentication(authentication);

        const verify = authorization.verify();

        expect(verify.valid).toBeFalsy();
    });

    it('Empty auth credentials', () => {
        const authorization: HttpBasicAuthentication = new HttpBasicAuthentication({basic: ''});

        const verify = authorization.verify('Basic QWxhZGRpbjpPcGVuU2VzYW1l');

        expect(verify.every((test) => test.valid)).toBeFalsy();
    });

});