export abstract class StartEvent {
    abstract start(): Promise<void>;
    abstract getReport(): any;
}