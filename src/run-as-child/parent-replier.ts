export interface ParentReplier {
    process(message: any): Promise<boolean>;
}
