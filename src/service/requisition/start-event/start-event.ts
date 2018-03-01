import {EventCallback} from "../event-callback";
import {Publish} from "./publish/publish";
import {SubscriptionFactory} from "../subscription/subscription-factory";
import {Subscription} from "../subscription/subscription";
import {PublishFactory} from "./publish/publish-factory";

export class StartEvent {

    timeout: number = -1;

    publish: Publish | null = null;

    subscription: Subscription | null = null;

    execute(eventCallback: EventCallback): void {
        if (this.publish) {
            const publish = new PublishFactory().createPublisher(this.publish);
            if (publish)
                publish.execute(eventCallback);
        }
        if (this.subscription) {
            const subscription = new SubscriptionFactory().createSubscription(this.subscription)
            if (subscription)
                subscription.subscribe(eventCallback, () => {});
        }
    }
}