import {Subscription} from "../subscription/subscription";
import {Type} from "class-transformer";

export class StartEvent {

    public publisher: any;

    @Type(() => Subscription)
    public subscription: Subscription | null = null;
}