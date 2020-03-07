import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';
import {ChildSendingEvents} from './child-sending-events';
import {ParentReplier} from './parent-replier';

export class ProtocolDescriber implements ParentReplier {
    public async process(message: any): Promise<boolean> {
        const protocols = DynamicModulesManager.getInstance().getProtocolManager().getProtocolsDescription();
        process.send!(
            {
                event: ChildSendingEvents.PROTOCOLS_LIST,
                value: protocols
            });
        return true;
    }
}
