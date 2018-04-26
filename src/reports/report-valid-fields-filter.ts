import {Report, Test} from "./report";
import {isNullOrUndefined} from "util";

export class ReportValidFieldsFilter {

    public filterReport(report: Report): any {
        let clone = Object.assign({}, report);
        delete clone.name;
        return this.removeNotValidableField(clone);
    }

    private removeNotValidableField(value: any) {
        if (isNullOrUndefined(value.valid)) {
            return {};
        }
        let clone: any = {};
        for (const key in value)
        {
            if (key == 'valid') {
                clone[key] = value.valid;
            }
            else if (key == 'tests' && value.tests.length > 0) {
                clone.tests = value.tests.map((test: Test) => {
                    let testSummary: any = {};
                    testSummary[test.name] = test.valid;
                    return testSummary;
                })
            }
            else if (typeof value[key] == 'object') {
                const newObject = this.removeNotValidableField(value[key])
                if (Object.keys(newObject).length > 1)
                    clone[key] = newObject;
            }
        };
        return clone;
    }

}