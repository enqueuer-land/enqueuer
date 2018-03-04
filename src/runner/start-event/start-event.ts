export interface StartEvent {
    start(): Promise<void>;
    getReport(): any;
}