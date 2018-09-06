export abstract class DaemonInputAdapter {
    public abstract adapt(message: any): string | undefined;
}