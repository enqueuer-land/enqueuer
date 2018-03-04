import { ReportReplier } from "./report-replier";
import { Report } from "./report";
const prettyjson = require('prettyjson');

const options = {
    indent: 6,
    keysColor: "white",
    dashColor: "white"
  };

export class StandardOutputReporterReplier implements ReportReplier {

    constructor(mqttProperties: any) {
    }

    report(report: Report): boolean {
        console.log(prettyjson.render(report, options));
        return true;
    }
}