import {HttpNoAuthentication} from './http-no-authentication';

describe('HttpNoAuthentication', () => {

    it('generate', () => {
        const no: HttpNoAuthentication = new HttpNoAuthentication({});

        const value: any = no.generate();

        expect(value).toBeNull();
    });

    it('verify', () => {
        const no: HttpNoAuthentication = new HttpNoAuthentication({});

        const value = no.verify(no.generate());

        expect(value.every(test => !test.valid)).toBeTruthy();
    });

});
