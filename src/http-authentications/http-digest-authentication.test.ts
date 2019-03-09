import {HttpDigestAuthentication} from './http-digest-authentication';

describe('HttpDigestAuthentication', () => {
    it('generate MD5-sess', () => {
        const authentication = {
            digest: {
                username: 'guest',
                password: 'guest',
                realm: 'nqrRealm',

                method: 'GET',
                algorithm: HttpDigestAuthentication.MD5_SESS,
                uri: '/auth/02-2617.php',

                nonce: '58bac26865505',
                nonceCount: '00000001',
                clientNonce: '72ae56dde9406045',
                opaque: 'opaque',
                qop: 'auth'
            }
        };
        const digest: HttpDigestAuthentication = new HttpDigestAuthentication(authentication);

        const value: any = digest.generate();

        const expected = {
            authorization: 'Digest username="guest",' +
            ' realm="nqrRealm",' +
            ' nonce="58bac26865505",' +
            ' uri="/auth/02-2617.php",' +
            ' algorithm="MD5-sess",' +
            ' response="9e254ee246ca9f39a82048580b2e7e53",' +
            ' opaque="opaque"'
        };

        expect(value).toEqual(expected);
    });

    it('first hash', () => {
        const authentication = {
            digest: {
                username: 'guest',
                password: 'guest',
                realm: 'nqrRealm'
            }
        };
        const digest: HttpDigestAuthentication = new HttpDigestAuthentication(authentication);

        const value: any = digest.firstHash();

        expect(value).toBe('a429de301f1bd4aa42fbf8d52e5d6b28');
    });

    it('second hash', () => {
        const authentication = {
            digest: {
                method: 'GET',
                uri: '/auth/02-2617.php'
            }
        };
        const digest: HttpDigestAuthentication = new HttpDigestAuthentication(authentication);

        const value: any = digest.secondHash();

        expect(value).toBe('b6a6df472ee01a9dbccba5f5e6271ca8');
    });

    it('response MD5', () => {
        const authentication = {
            digest: {
                username: 'guest',
                password: 'guest',
                realm: 'nqrRealm',

                method: 'GET',
                uri: '/auth/02-2617.php',

                opaque: 'opaque',
                nonce: '58bac26865505',
                nonceCount: '00000001',
                clientNonce: '72ae56dde9406045',
                qop: 'auth'
            }
        };
        const digest: HttpDigestAuthentication = new HttpDigestAuthentication(authentication);

        const value: any = digest.generate();

        const expected = {
            authorization: 'Digest username="guest",' +
            ' realm="nqrRealm",' +
            ' nonce="58bac26865505",' +
            ' uri="/auth/02-2617.php",' +
            ' algorithm="MD5",' +
            ' response="a42e17afd5200c6f2dab4e278cfe39bf",' +
            ' opaque="opaque"'
        };

        expect(value).toEqual(expected);
    });

    it('verify', () => {
        const authentication = {
            digest: {
                username: 'guest',
                password: 'guest',
                realm: 'nqrRealm',

                method: 'GET',
                uri: '/auth/02-2617.php',

                opaque: 'opaque',
                nonce: '58bac26865505',
                nonceCount: '00000001',
                clientNonce: '72ae56dde9406045',
                qop: 'auth'
            }
        };
        const digest: HttpDigestAuthentication = new HttpDigestAuthentication(authentication);

        const authorization = 'Digest username="guest",' +
            ' realm="nqrRealm",' +
            ' nonce="58bac26865505",' +
            ' uri="/auth/02-2617.php",' +
            ' algorithm="MD5",' +
            ' response="a42e17afd5200c6f2dab4e278cfe39bf",' +
            ' opaque="opaque"';

        const tests: any = digest.verify(authorization);

        expect(tests.every(test => test.valid)).toBeTruthy();
    });

    it('prefix was not found', () => {
        const authentication = {
            digest: {}
        };
        const digest: HttpDigestAuthentication = new HttpDigestAuthentication(authentication);

        const authorization = 'NotDigest username="guest"';

        const tests: any = digest.verify(authorization);

        expect(tests.some(test => !test.valid)).toBeTruthy();
        expect(tests.find(test => test.name == '"Digest" authentication prefix').valid).toBeFalsy();
    });

    it('response is not ok', () => {
        const authentication = {
            digest: {
                username: 'guest',
                password: 'guest',
                realm: 'nqrRealm',

                method: 'GET',
                uri: '/auth/02-2617.php',

                nonce: '58bac26865505',
                nonceCount: '00000001',
                opaque: 'opaque',
                clientNonce: '72ae56dde9406045',
                qop: 'auth'
            }
        };
        const digest: HttpDigestAuthentication = new HttpDigestAuthentication(authentication);

        const authorization = 'Digest username="guest",' +
            ' realm="nqrRealm",' +
            ' nonce="58bac26865505",' +
            ' uri="/auth/02-2617.php",' +
            ' algorithm="MD5",' +
            ' response="obviouslyWrong",' +
            ' opaque="opaque"';

        const tests: any = digest.verify(authorization);

        expect(tests.some(test => !test.valid)).toBeTruthy();
        expect(tests.find(test => test.name == '"Response" authentication value').valid).toBeFalsy();
    });

    it('some value (username) does not match', () => {
        const authentication = {
            digest: {
                username: 'WRONG',
                password: 'guest',
                realm: 'nqrRealm',

                method: 'GET',
                uri: '/auth/02-2617.php',

                opaque: 'opaque',
                nonce: '58bac26865505',
                nonceCount: '00000001',
                clientNonce: '72ae56dde9406045',
                qop: 'auth'
            }
        };
        const digest: HttpDigestAuthentication = new HttpDigestAuthentication(authentication);

        const authorization = 'Digest username="guest",' +
            ' realm="nqrRealm",' +
            ' nonce="58bac26865505",' +
            ' uri="/auth/02-2617.php",' +
            ' algorithm="MD5",' +
            ' response="obviouslyWrong",' +
            ' opaque="opaque"';

        const tests: any = digest.verify(authorization);

        expect(tests.some(test => !test.valid)).toBeTruthy();
        expect(tests.find(test => test.name == `"username" value does not match`).valid).toBeFalsy();
    });

    it('essential fields are missing as constructor attribute', () => {
        const authentication = {
            digest: {
                password: 'guest',
                realm: 'nqrRealm',
                opaque: 'opaque'
            }
        };
        const digest: HttpDigestAuthentication = new HttpDigestAuthentication(authentication);

        const authorization = 'Digest username="guest",' +
            ' realm="nqrRealm",' +
            ' nonce="58bac26865505",' +
            ' uri="/auth/02-2617.php",' +
            ' algorithm="MD5",' +
            ' response="obviouslyWrong",' +
            ' opaque="opaque"';

        const tests: any = digest.verify(authorization);

        expect(tests.some(test => !test.valid)).toBeTruthy();
        expect(tests.find(test => test.name == `"username" was not found as attribute`).valid).toBeFalsy();
    });

    it('essential fields are missing as authorization string', () => {
        const authentication = {
            digest: {
                username: 'WRONG',
                password: 'guest',
                realm: 'nqrRealm',

                method: 'GET',
                uri: '/auth/02-2617.php',

                opaque: 'opaque',
                nonce: '58bac26865505',
                nonceCount: '00000001',
                clientNonce: '72ae56dde9406045',
                qop: 'auth'
            }
        };
        const digest: HttpDigestAuthentication = new HttpDigestAuthentication(authentication);

        const authorization = 'Digest username="guest",' +
            ' realm="nqrRealm",' +
            ' nonce="58bac26865505",' +
            ' uri="/auth/02-2617.php",' +
            ' response="obviouslyWrong",' +
            ' opaque="opaque"';

        const tests: any = digest.verify(authorization);

        expect(tests.some(test => !test.valid)).toBeTruthy();
        expect(tests.find(test => test.name == `Every field was found`).valid).toBeFalsy();
    });

});
