import {EventCallback} from "../event-callback";
import {Type} from "class-transformer";
import {Subscription} from "../subscription/subscription";
import {Publish} from "./publish";

export class StartEvent {

    timeout: number = -1;

    payload: string = "";

    @Type(() => Publish)
    publish: Publish | null = null;

    @Type(() => Subscription)
    subscription: Subscription | null = null;

    execute(eventCallback: EventCallback): void {
        console.log(`Start event ${this}`);
        if (this.publish) {
            this.publish.eventCallback = eventCallback;
            this.publish.execute();
        }
        if (this.subscription)
            this.subscription.subscribe(eventCallback);
    }
}