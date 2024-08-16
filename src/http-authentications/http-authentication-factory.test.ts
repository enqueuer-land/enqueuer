import { HttpAuthenticationFactory } from './http-authentication-factory';
import { HttpNoAuthentication } from './http-no-authentication';
import { HttpBasicAuthentication } from './http-basic-authentication';
import { HttpBearerAuthentication } from './http-bearer-authentication';
import { HttpDigestAuthentication } from './http-digest-authentication';

describe('HttpAuthenticationFactory', () => {
    it('should return default', () => {
        expect(new HttpAuthenticationFactory().create({})).toBeInstanceOf(HttpNoAuthentication);
    });

    it('should return basic', () => {
        expect(new HttpAuthenticationFactory().create({ basic: true })).toBeInstanceOf(HttpBasicAuthentication);
    });

    it('should return bearer', () => {
        expect(new HttpAuthenticationFactory().create({ bearer: { token: true } })).toBeInstanceOf(
            HttpBearerAuthentication
        );
    });

    it('should return digest', () => {
        expect(new HttpAuthenticationFactory().create({ digest: true })).toBeInstanceOf(HttpDigestAuthentication);
    });
});
