import {HookModel} from '../models/outputs/hook-model';

export class HookReporter {
    private readonly hook: HookModel;

    public constructor(hookModel?: HookModel) {
        this.hook = {
            valid: true,
            tests: [],
            arguments: {}
        };
        this.addValues(hookModel);
    }

    public addValues(hookModel: HookModel = {valid: true, tests: [], arguments: {}}): HookModel {
        this.hook.tests = this.hook.tests.concat(hookModel.tests);
        this.hook.arguments = Object.assign({}, this.hook.arguments, hookModel.arguments);
        this.hook.valid = this.hook.tests.every(test => test.valid || test.ignored);
        return this.hook;
    }
}
