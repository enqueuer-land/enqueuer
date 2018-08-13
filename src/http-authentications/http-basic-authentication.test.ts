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

        expect(value.authorization).toBe('Basic dXNlcjpwYXNzd29yZA==');//dW5kZWZpbmVkOnVuZGVmaW5lZA
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

});