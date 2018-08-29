import {NullPublisher} from "./null-publisher";
import {PublisherModel} from "../models/inputs/publisher-model";

describe('NullPublisher', () => {

    it('Should reject', done => {
        const config: PublisherModel = {
            type: 'unknown',
            name: 'unknown description'
        };

        const runner = new NullPublisher(config);

        runner.publish()
            .catch(err => {
                expect(err).toBeDefined();
                done();
            });
    });
});