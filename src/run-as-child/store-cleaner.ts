import { ParentReplier } from './parent-replier';
import { Store } from '../configurations/store';

export class StoreCleaner implements ParentReplier {
  public async process(): Promise<boolean> {
    Store.refreshData();
    return true;
  }
}
