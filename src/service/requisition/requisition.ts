import {Type} from "class-transformer";
import "reflect-metadata";
import {StartEvent} from "./start-event/start-event";

export class Requisition {
    subscriptions: any = [];

    @Type(() => StartEvent)
    startEvent: StartEvent = new StartEvent();

    reports: any;
}
