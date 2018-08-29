import {NullRunExecutor} from "./null-run-executor";

describe('NullRunExecutor', () => {

    it('Should reject', done => {
        const config = {key: 'value'};
        const runner = new NullRunExecutor(config);

        runner.execute()
            .catch(err => {
                expect(err).toBeDefined();
                done();
            });
    });
});