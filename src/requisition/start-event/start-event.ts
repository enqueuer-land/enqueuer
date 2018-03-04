import {Publisher} from "./publish/publisher";
import {Subscription} from "../subscription/subscription";
import {Type} from "class-transformer";

export class StartEvent {

    timeout: number = -1;

    @Type(() => Publisher)
    publisher: Publisher | null = null;

    @Type(() => Subscription)
    subscription: Subscription | null = null;
}