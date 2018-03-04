import {Type} from "class-transformer";
import "reflect-metadata";
import {StartEvent} from "./start-event/start-event";
import {Report} from "../report/report";
import {Subscription} from "./subscription/subscription";

export class Requisition {

    public timeout: number | null = null;

    @Type(() => Subscription)
    public subscriptions: Subscription[] = [];

    @Type(() => StartEvent)
    public startEvent: StartEvent = new StartEvent();

    @Type(() => Report)
    public reports: Report[] = [];
}
