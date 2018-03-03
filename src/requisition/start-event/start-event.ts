import {Publisher} from "./publish/publisher";
import {Subscription} from "../subscription/subscription";

export class StartEvent {

    timeout: number = -1;

    publisher: Publisher | null = null;

    subscription: Subscription | null = null;
}