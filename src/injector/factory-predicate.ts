export type FactoryPredicate = (argument: any) => boolean;
export const NullFactoryPredicate: FactoryPredicate = (): boolean => {return false};
