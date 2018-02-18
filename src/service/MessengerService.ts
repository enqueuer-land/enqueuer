import { Report } from "../report/report";

export type MessengerServiceCallback = (report: Report) => void;
export interface MessengerService {
    start(onFinishCallback: MessengerServiceCallback): void;
}