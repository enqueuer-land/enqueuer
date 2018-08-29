import {NullPublisher} from "./null-publisher";
import {PublisherModel} from "../models/inputs/publisher-model";

describe('NullPublisher', () => {

    it('Should reject', () => {
        const config: PublisherModel = {
            type: 'unknown',
            name: 'unknown description'
        };

        const runner = new NullPublisher(config);

        expect(runner.publish()).rejects.toBeDefined();
    });
});