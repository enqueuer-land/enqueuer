"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_1 = require("../configurations/configuration");
class Store {
    constructor() {
        //private
    }
    static getData() {
        if (!Store.data) {
            Store.data = new configuration_1.Configuration().getStore();
        }
        return Store.data;
    }
}
Store.data = null;
exports.Store = Store;
