import { ReportReplier } from "./report-replier";
const prettyjson = require('prettyjson');

const options = {
    indent: 6,
    keysColor: "white",
    dashColor: "white"
  };

export class StandardOutputReporterReplier implements ReportReplier {

    constructor(properties: any) {
    }

    report(report: string): boolean {
        console.log(prettyjson.render(JSON.parse(report), options));
        return true;
    }
}