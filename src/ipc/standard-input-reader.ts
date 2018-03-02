import {RequisitionReader} from "./requisition-reader";

export class StandardInputReader implements RequisitionReader {

    private requisition: string = "";

    constructor() {
        process.stdin.setEncoding('utf8');
        process.stdin.resume();
    }

    public start(): Promise<string> {
        console.log("Starting StandardInputReader");
        return new Promise((resolve, reject) => {
            process.stdin.on('data', (chunk) => this.requisition += chunk);
            process.stdin.on('end', () => resolve(this.requisition));

            //process.stdin.pause();
        });
    }
}