"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
const conditional_injector_1 = require("conditional-injector");
const result_creator_1 = require("./result-creator");
const fs = __importStar(require("fs"));
const yaml = __importStar(require("yamljs"));
let FileResultCreator = class FileResultCreator extends result_creator_1.ResultCreator {
    constructor(resultCreatorAttributes) {
        super();
        this.report = {
            name: resultCreatorAttributes.filename,
            tests: [],
            valid: true,
            runnables: []
        };
    }
    addTestSuite(name, report) {
        this.report.runnables.push(report);
        this.report.valid = this.report.valid && report.valid;
    }
    addError(err) {
        this.report.valid = false;
    }
    isValid() {
        return this.report.valid;
    }
    create() {
        let content = this.report;
        if (this.report.name.endsWith('yml') || this.report.name.endsWith('yaml')) {
            content = yaml.stringify(content, 10, 2);
        }
        else {
            content = JSON.stringify(content, null, 2);
        }
        fs.writeFileSync(this.report.name, content);
    }
};
FileResultCreator = __decorate([
    conditional_injector_1.Injectable({ scope: conditional_injector_1.Scope.Application,
        predicate: (resultCreatorAttributes) => resultCreatorAttributes && resultCreatorAttributes.type === 'file' }),
    __metadata("design:paramtypes", [Object])
], FileResultCreator);
exports.FileResultCreator = FileResultCreator;
