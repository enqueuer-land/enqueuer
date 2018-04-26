"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const configuration_1 = require("./configurations/configuration");
const enqueuer_executor_1 = require("./executors/enqueuer-executor");
const logger_1 = require("./loggers/logger");
const conditional_injector_1 = require("conditional-injector");
class EnqueuerStarter {
    constructor() {
        const configuration = new configuration_1.Configuration();
        this.executor = conditional_injector_1.Container.subclassesOf(enqueuer_executor_1.EnqueuerExecutor).create(configuration.getRequisitionRunMode());
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.executor.init()
                .then(() => this.executor.execute())
                .then((report) => {
                logger_1.Logger.info("Enqueuer execution is over (" + report.valid + ")");
                return report.valid ? 0 : 1;
            })
                .catch((error) => {
                logger_1.Logger.fatal(`Execution error: ${error}`);
                return -1;
            });
        });
    }
}
exports.EnqueuerStarter = EnqueuerStarter;
