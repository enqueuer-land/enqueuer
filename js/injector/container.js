"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parent_class_container_1 = require("./parent-class-container");
class Container {
    static getSuperClassContainer(superClassName) {
        if (!Container.injectableContainer[superClassName])
            Container.injectableContainer[superClassName] = new parent_class_container_1.ParentClassContainer();
        return Container.injectableContainer[superClassName];
    }
    static get(superClass) {
        const superClassName = superClass.prototype.constructor.name;
        return Container.injectableContainer[superClassName];
    }
}
Container.injectableContainer = {};
exports.Container = Container;
