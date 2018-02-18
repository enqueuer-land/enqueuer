import {Type, plainToClass, Exclude, Expose} from "class-transformer";
import "reflect-metadata";

export class MqttRequisitionFile {
    brokerAddress: string = "";

    @Type(() => Subscriptions)
    subscriptions: Subscriptions[] = [];

    @Type(() => Publish)
    publish: Publish | null = null;
}

export class Publish {
    topic: string = "";
    payload: string = "";
}

export class Subscriptions {
    timeout: number | null = null;
    topic: string = "";

    private testFunctionBody: string | null = null;

    testFunction: Function | null = () =>  {
        if (this.testFunctionBody == null)
            return null;

        const fullBody: string = `let test = {}; ${this.testFunctionBody}; return test`;
        return new Function('response', fullBody);
    }
}