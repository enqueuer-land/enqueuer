import {Configuration} from './configuration';

export class Store {
    private static data: any = {};

    private constructor() {
        //private
    }

    public static getData(): any {
        if (!Store.data || Object.keys(Store.data).length == 0) {
            this.refreshData();
        }
        return Store.data;
    }

    public static refreshData() {
        try {
            Store.data = Object.assign({}, Configuration.getValues().store, process.env);
        } catch (err) {
            /*
                do nothing
             */
        }
    }
}
