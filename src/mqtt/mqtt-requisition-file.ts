import {Type, plainToClass, Exclude, Expose} from "class-transformer";
import "reflect-metadata";

export class MqttRequisitionFile {
    brokerAddress: string = "";

    @Type(() => Subscription)
    subscriptions: Subscription[] = [];

    @Type(() => Publish)
    publish: Publish | null = null;
}

export class Publish {
    topic: string = "";
    payload: string = "";
}

export class Subscription {
    timeout: number | null = null;
    topic: string = "";

    private testFunctionBody: string | null = null;

    createTestFunction(): Function | null {
        if (this.testFunctionBody == null)
            return null;

        const fullBody: string = `let test = {}; ${this.testFunctionBody}; return test`;
        return new Function('response', fullBody);
    }
}