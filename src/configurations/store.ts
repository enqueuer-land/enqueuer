import {Configuration} from './configuration';
import {Logger} from '../loggers/logger';

export class Store {
    private static data: any = undefined;

    private constructor() {
        //private
    }

    public static getData(): any {
        if (Store.data === undefined) {
            try {
                Store.data = process.env;
                const configurationStore = Configuration.getInstance().getStore();
                Store.data = Object.assign({}, configurationStore, Store.data);
            } catch (err) {
                Logger.warning(err);
            }
        }
        return Store.data;
    }

    public static refreshData(): any {
        Store.data = undefined;
        return Store.getData();
    }
}
