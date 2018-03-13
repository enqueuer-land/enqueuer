export let injectableContainer: any = {};
export function Container(): any {
    return Object.assign({}, injectableContainer);
}