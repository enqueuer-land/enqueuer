import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';
import {ChildSendingEvents} from './child-sending-events';
import {ParentReplier} from './parent-replier';

export class AssertDescriber implements ParentReplier {
    public async process(message: any): Promise<boolean> {
        const asserters = DynamicModulesManager.getInstance().getAsserterManager().getMatchingAsserters('');
        process.send!({
            event: ChildSendingEvents.ASSERTERS_LIST,
            value: asserters
        });
        return true;
    }
}
