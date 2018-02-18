import {Type, plainToClass} from "class-transformer";
import "reflect-metadata";

export class MqttRequisitionFile {
    brokerAddress: string = "";
    totalTimeout: number = 0;

    subscriptions: Subscriptions[] = [];

    publish: Publish = new Publish();
}

export class Publish {
    topic: string = "";
    payload: string = "";
}

export class Subscriptions {
    topic: string = "";
}