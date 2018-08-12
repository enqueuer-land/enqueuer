import {Configuration} from '../configurations/configuration';

export class Store {
    private static data: any = null;

    private constructor() {
        //private
    }

    public static getData(): any {
        if (!Store.data) {
            Store.data = new Configuration().getFileVariables();
        }
        return Store.data;
    }
}