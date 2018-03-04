import {Publisher} from "./publish/publisher";
import {Subscription} from "../subscription/subscription";
import {Type} from "class-transformer";

export class StartEvent {

    @Type(() => Publisher)
    public publisher: Publisher | null = null;

    @Type(() => Subscription)
    public subscription: Subscription | null = null;
}