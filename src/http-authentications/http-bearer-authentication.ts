import { HttpAuthentication } from './http-authentication';
import { TestModel } from '../models/outputs/test-model';
import { Logger } from '../loggers/logger';

export class HttpBearerAuthentication implements HttpAuthentication {
  private readonly token: any;

  public constructor(authentication: any) {
    this.token = authentication.bearer.token;
  }

  public generate(): any {
    return { authorization: 'Bearer ' + this.token };
  }

  public verify(authorization: string): TestModel[] {
    const tests = [];
    try {
      const token = authorization.split(' ')[1];
      tests.push(this.authenticatePrefix(authorization.split(' ')[0]));
      tests.push(this.authenticateToken(token));
    } catch (err) {
      Logger.error(`Error trying to authenticate: ${err}`);
    }
    tests.push(this.bearerAuthentication(tests));

    return tests;
  }

  private bearerAuthentication(tests: TestModel[]) {
    let test = {
      name: '"Bearer" authentication',
      valid: false,
      description: "Fail to authenticate 'Bearer' authentication"
    };
    if (tests.length > 0) {
      if (tests.every(test => test.valid)) {
        test.valid = true;
        test.description = `Bearer authentication is valid`;
      }
    }
    return test;
  }

  private authenticatePrefix(prefix: string) {
    let test = {
      name: '"Bearer" authentication prefix',
      valid: false,
      description: `Prefix "Bearer" was not found in Bearer authentication. Got ${prefix} instead`
    };
    if (prefix == 'Bearer') {
      test.valid = true;
      test.description = `Prefix "Bearer" was found.`;
    }
    return test;
  }

  private authenticateToken(token: string) {
    let test = {
      name: '"Bearer" authentication token',
      valid: false,
      description: `Token does not match. Got ${token} instead`
    };
    if (token == this.token) {
      test.valid = true;
      test.description = `Token match`;
    }
    return test;
  }
}
