"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_1 = require("./configuration");
class Store {
    constructor() {
        //private
    }
    static getData() {
        if (!Store.data || Object.keys(Store.data).length == 0) {
            try {
                Store.data = configuration_1.Configuration.getValues().store;
            }
            catch (err) {
                /*
                    do nothing
                 */
            }
        }
        return Store.data;
    }
}
Store.data = {};
exports.Store = Store;
