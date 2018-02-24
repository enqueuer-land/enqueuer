import {Type} from "class-transformer";
import "reflect-metadata";
import {StartEvent} from "./start-event/start-event";
import {Subscription} from "./subscription/subscription";

export class Requisition {
    protocol: string = "";
    brokerAddress: string = "";

    @Type(() => Subscription)
    subscriptions: Subscription[] = [];

    @Type(() => StartEvent)
    startEvent: StartEvent = new StartEvent();

    reports: any;
}
