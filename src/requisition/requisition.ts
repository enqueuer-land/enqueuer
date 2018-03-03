import {Type} from "class-transformer";
import "reflect-metadata";
import {StartEvent} from "./start-event/start-event";
import {Report} from "../report/report";
import {Subscription} from "./subscription/subscription";

export class Requisition {
    @Type(() => Subscription)
    subscriptions: Subscription[] = [];

    @Type(() => StartEvent)
    startEvent: StartEvent = new StartEvent();

    @Type(() => Report)
    reports: Report[] = [];
}
