import {NullPublisher} from "./null-publisher";
import {NullSubscription} from "./null-subscription";
import {SubscriptionModel} from "../models/inputs/subscription-model";

describe('NullSubscription', () => {

    it('Should reject subscription', () => {
        const config: SubscriptionModel = {
            type: 'unknown',
            name: 'unknown description'
        };

        const runner = new NullSubscription(config);

        expect(runner.subscribe()).rejects.toBeDefined();
    });

    it('Should reject receiveMessage', () => {
        const config: SubscriptionModel = {
            type: 'unknown',
            name: 'unknown description'
        };

        const runner = new NullSubscription(config);

        expect(runner.receiveMessage()).rejects.toBeDefined();
    });
});