import {HookModel} from '../models/outputs/hook-model';
import {testModelIsNotFailing} from '../models/outputs/test-model';

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
        this.hook.valid = this.hook.tests.every((test) => testModelIsNotFailing(test));
        return this.hook;
    }
}
