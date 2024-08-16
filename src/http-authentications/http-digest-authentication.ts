import {HttpAuthentication} from './http-authentication';
import {TestModel} from '../models/outputs/test-model';
import {createHash} from 'crypto';

export class HttpDigestAuthentication implements HttpAuthentication {
    public static MD5_SESS = 'MD5-sess';

    private readonly qop: string;
    private readonly algorithm: string;
    private readonly nonce: string;
    private readonly nonceCount: string;
    private readonly clientNonce: string;
    private readonly method: string;
    private readonly uri: any;
    private readonly username: string;
    private readonly realm: string;
    private readonly password: string;
    private readonly opaque: string;

    public constructor(authentication: any) {
        const digest = authentication.digest;
        this.qop = digest.qop;
        this.algorithm = digest.algorithm;
        this.nonce = digest.nonce;
        this.nonceCount = digest.nonceCount;
        this.clientNonce = digest.clientNonce;
        this.method = digest.method;
        this.uri = digest.uri;
        this.username = digest.username;
        this.realm = digest.realm;
        this.password = digest.password;
        this.opaque = digest.opaque;

        if (HttpDigestAuthentication.MD5_SESS !== this.algorithm) {
            this.algorithm = 'MD5';
        }
    }

    public generate(): any {
        const response = this.generateResponse();
        return {authorization: this.createDigestValue(response)};
    }

    public verify(authorization: string): TestModel[] {
        const tests: TestModel[] = [];
        const parts = authorization.split(' ');
        tests.push(this.checkDigestPrefix(parts[0]));
        const params = parts.slice(1).join(' ');
        const tokens = params.split(/,(?=(?:[^"]|"[^"]*")*$)/) || [];
        const essentialFields = this.buildEssentialFields();
        tokens.forEach((token) => tests.push(this.analyzeToken(token, essentialFields)));
        tests.push(this.checkEssentialFieldsMissingInAuthorization(essentialFields));
        return tests;
    }

    private buildEssentialFields() {
        const essentials: any = Object.assign({}, this);
        delete essentials.response;
        delete essentials.password;
        delete essentials.qop;
        delete essentials.nonceCount;
        delete essentials.clientNonce;
        delete essentials.method;
        return essentials;
    }

    private generateResponse() {
        const hash1 = this.firstHash();
        const hash2 = this.secondHash();

        if (this.qop) {
            return this.md5(`${hash1}:${this.nonce}:${this.nonceCount}:${this.clientNonce}:${this.qop}:${hash2}`);
        } else {
            return this.md5(`${hash1}:${this.nonce}:${hash2}`);
        }
    }

    private secondHash() {
        return this.md5(`${this.method}:${this.uri}`);
    }

    private firstHash() {
        // Hash1=MD5(username:realm:password)
        let hash1 = this.md5(`${this.username}:${this.realm}:${this.password}`);
        if (this.algorithm === HttpDigestAuthentication.MD5_SESS) {
            hash1 = this.md5(`${hash1}:${this.nonce}:${this.clientNonce}`);
        }
        return hash1;
    }

    private md5(value: string): string {
        return createHash('MD5').update(value).digest('hex');
    }

    private createDigestValue(response: string) {
        let value = `Digest`;
        value += ` username="${this.username}"`;
        value += `, realm="${this.realm}"`;
        value += `, nonce="${this.nonce}"`;
        value += `, uri="${this.uri}"`;
        value += `, algorithm="${this.algorithm}"`;
        value += `, response="${response}"`;
        value += `, opaque="${this.opaque}"`;
        return value;
    }

    private analyzeToken(token: string, essentialFields: any): TestModel {
        let value = token.split('=');
        const key = value[0].trimRight().trimLeft();
        const self = essentialFields[key];
        delete essentialFields[key];
        if (key == 'response') {
            return this.checkResponseValue(value[1]);
        }
        if (!self) {
            return this.attributeNotFoundTest(key);
        }
        const thisValue = `"${self}"`;

        let test = {
            name: `"${key}" value does not match`,
            valid: false,
            description: `Expected '${key}'. Got '${value[1]}' instead`
        };

        if (thisValue == value[1]) {
            test.valid = true;
            test.description = `Calculated "${key}" value matches`;
        }
        return test;
    }

    private attributeNotFoundTest(key: string) {
        return {
            name: `"${key}" was not found as attribute`,
            valid: false,
            description: `Expected to find '${key}' but got nothing`
        };
    }

    private checkResponseValue(response?: string): TestModel {
        const generateResponse = `"${this.generateResponse()}"`;
        let test = {
            name: '"Response" authentication value',
            valid: false,
            description: `Calculated "response" value does not match`
        };

        if (response && response == generateResponse) {
            test.valid = true;
            test.description = `Calculated "response" value matches`;
        }
        return test;
    }

    private checkDigestPrefix(prefix: string): TestModel {
        let test = {
            name: '"Digest" authentication prefix',
            valid: false,
            description: `Prefix "Digest" was not found in Basic authentication. Got ${prefix} instead`
        };
        if (prefix == 'Digest') {
            test.valid = true;
            test.description = `Prefix "Digest" was found`;
        }
        return test;
    }

    private checkEssentialFieldsMissingInAuthorization(selfCopy: any) {
        const notUsedKeys = Object.keys(selfCopy) || [];
        let test = {
            name: 'Every field was found',
            valid: false,
            description: `Keys '${notUsedKeys.join('; ')}' were not found in authorization`
        };
        if (notUsedKeys.length == 0) {
            test.valid = true;
            test.description = `Every field was found`;
        }
        return test;
    }
}
