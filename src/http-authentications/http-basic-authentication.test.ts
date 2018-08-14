import {HttpBasicAuthentication} from './http-basic-authentication';

describe('HttpBasicAuthentication', () => {

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

        expect(verify.every((test) => test.valid)).toBe(true);
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

        expect(verify.every((test) => test.valid)).toBe(true);
    });

});