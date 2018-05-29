import {ReportModel} from "./report-model";
import {ResultModel} from "./result-model";

export interface SingleRunResultModel extends ReportModel {
    runnables: {[runnableName: string]: ResultModel;};
}