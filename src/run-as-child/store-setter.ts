import {Store} from '../configurations/store';
import {ParentReplier} from './parent-replier';

export class StoreSetter implements ParentReplier {
    public async process(message: any): Promise<boolean> {
        Object.keys(message.value || {}).forEach(key => {
            Store.getData()[key] = message.value[key];
        });
        return true;
    }
}
