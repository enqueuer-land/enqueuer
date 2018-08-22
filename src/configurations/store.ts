import {Configuration} from './configuration';

export class Store {
    private static data: any = null;

    private constructor() {
        //private
    }

    public static getData(): any {
        if (!Store.data) {
            Store.data = new Configuration().getStore();
        }
        return Store.data;
    }
}