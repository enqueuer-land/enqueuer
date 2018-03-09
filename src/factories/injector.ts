export const Injector = (type: string) => {
    const injectables: any = {};

    return function(target: any) {
        var parentTarget = Object.getPrototypeOf(target.prototype).constructor.name;
        if (!injectables[parentTarget])
            injectables[parentTarget] = [];
        injectables[parentTarget][type] = target;
        return target;
    };
}
