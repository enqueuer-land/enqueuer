import {HttpAuthentication} from './http-authentication';
import {HttpBasicAuthentication} from './http-basic-authentication';
import {HttpBearerAuthentication} from './http-bearer-authentication';
import {HttpDigestAuthentication} from './http-digest-authentication';
import {HttpNoAuthentication} from './http-no-authentication';

export class HttpAuthenticationFactory {
    public create(component: any): HttpAuthentication {
        if (component.basic) {
            return new HttpBasicAuthentication(component);
        } else if (component.bearer && component.bearer.token) {
            return new HttpBearerAuthentication(component);
        } else if (component.digest) {
            return new HttpDigestAuthentication(component);
        }
        return new HttpNoAuthentication(component);
    }
}
