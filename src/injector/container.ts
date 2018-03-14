import {SuperClassContainer} from "./super-class-container";

export class Container {

    private static injectableContainer: any = {};

    public static getSuperClassContainer(superClassName: string): any {
        if (!Container.injectableContainer[superClassName])
            Container.injectableContainer[superClassName] = new SuperClassContainer();

        return Container.injectableContainer[superClassName];
    }

    public static get(superClass: any): SuperClassContainer {
        const superClassName: string = superClass.prototype.constructor.name;
        return Container.injectableContainer[superClassName];
    }
}