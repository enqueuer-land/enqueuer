import {Publish} from "./publish/publish";
import {Subscription} from "../subscription/subscription";

export class StartEvent {

    timeout: number = -1;

    publish: Publish | null = null;

    subscription: Subscription | null = null;
}