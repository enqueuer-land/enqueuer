export abstract class EnqueuerExecutor {
    public abstract execute(): Promise<boolean>;
}