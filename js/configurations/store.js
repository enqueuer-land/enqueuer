"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_1 = require("./configuration");
class Store {
    constructor() {
        //private
    }
    static getData() {
        if (!Store.data) {
            Store.data = configuration_1.Configuration.getValues().store;
        }
        return Store.data;
    }
}
Store.data = null;
exports.Store = Store;
