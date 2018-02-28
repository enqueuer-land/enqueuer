import {EventCallback} from "../event-callback";
import {Type} from "class-transformer";
import {Publish} from "./publish";
import {SubscriptionAttributes} from "../subscription/subscription-attributes";
import {SubscriptionFactory} from "../subscription/subscription-factory";

export class StartEvent {

    timeout: number = -1;

    payload: string = "";

    @Type(() => Publish)
    publish: Publish | null = null;

    @Type(() => SubscriptionAttributes)
    subscription: SubscriptionAttributes | null = null;

    execute(eventCallback: EventCallback): void {
        console.log(`Start event ${this}`);
        if (this.publish) {
            this.publish.eventCallback = eventCallback;
            this.publish.execute();
        }
        if (this.subscription) {
            const subscription = new SubscriptionFactory().createSubscription(this.subscription)
            if (subscription)
                subscription.subscribe(eventCallback, () => {});
        }
    }
}