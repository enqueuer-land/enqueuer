export interface TimeModel {
    totalTime: number;
    startTime: Date | string;
    endTime: Date | string;
    timeout?: number;
}