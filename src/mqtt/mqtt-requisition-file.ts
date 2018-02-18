import {Type, plainToClass} from "class-transformer";
import "reflect-metadata";

export class MqttRequisitionFile {
    brokerAddress: string = "";

    subscriptions: Subscriptions[] = [];

    publish: Publish | null = null;
}

export class Publish {
    topic: string = "";
    payload: string = "";
}

export class Subscriptions {
    timeout: number | null = null;
    topic: string = "";
}