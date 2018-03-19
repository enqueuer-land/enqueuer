import {ParentClassContainer} from "./parent-class-container";

export class Container {

    private static injectableContainer: any = {};

    public static getSuperClassContainer(superClassName: string): any {
        if (!Container.injectableContainer[superClassName])
            Container.injectableContainer[superClassName] = new ParentClassContainer();

        return Container.injectableContainer[superClassName];
    }

    public static get(superClass: any): ParentClassContainer {
        const superClassName: string = superClass.prototype.constructor.name;
        return Container.injectableContainer[superClassName];
    }
}