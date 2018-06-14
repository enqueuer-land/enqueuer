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
const ResultCreator_1 = require("./ResultCreator");
const fs = __importStar(require("fs"));
let EnqueuerResultCreator = class EnqueuerResultCreator extends ResultCreator_1.ResultCreator {
    constructor(resultCreatorAttributes) {
        super();
        this.report = {
            name: resultCreatorAttributes.filename,
            tests: {},
            valid: true,
            runnables: {}
        };
    }
    addTestSuite(suite) {
        this.report.runnables[suite.name] = suite;
        this.report.valid = this.report.valid && suite.valid;
    }
    addError(err) {
        this.report.valid = false;
    }
    isValid() {
        return this.report.valid;
    }
    create() {
        fs.writeFileSync(this.report.name, JSON.stringify(this.report, null, 4));
    }
};
EnqueuerResultCreator = __decorate([
    conditional_injector_1.Injectable({ predicate: (resultCreatorAttributes) => resultCreatorAttributes && resultCreatorAttributes.type === "enqueuer" }),
    __metadata("design:paramtypes", [Object])
], EnqueuerResultCreator);
exports.EnqueuerResultCreator = EnqueuerResultCreator;
