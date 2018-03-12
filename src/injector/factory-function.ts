export type FactoryFunction = (argument: any) => boolean;
export const NullFactoryFunction: FactoryFunction = (): boolean => {return false};
