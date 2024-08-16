import {Configuration} from '../configurations/configuration';
import {ParentReplier} from './parent-replier';

export class ModuleAdder implements ParentReplier {
    public async process(message: any): Promise<boolean> {
        Configuration.getInstance().addPlugin(message.value);
        return true;
    }
}
