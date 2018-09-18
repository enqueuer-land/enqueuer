import {NullRunExecutor} from "./null-run-executor";

describe('NullRunExecutor', () => {

    it('Should reject', () => {
        const config = {key: 'value'};
        const runner = new NullRunExecutor(config);

        expect(runner.execute()).rejects.toBeDefined();
    });
});