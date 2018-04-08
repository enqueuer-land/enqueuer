"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../loggers/logger");
const requisition_parser_1 = require("./requisition-parser");
const chokidar = require('chokidar');
const fs = require("fs");
class SingleRunRequisitionInput {
    constructor(fileNamePattern) {
        this.requisitions = [];
        this.ready = false;
        this.pushRequisitionFile = (fileName) => {
            this.ready = true;
            logger_1.Logger.info(`Found requisition file: ${fileName}`);
            fs.readFile(fileName, (error, data) => {
                if (error)
                    logger_1.Logger.warning(`Error reading file ${JSON.stringify(error)}`);
                else {
                    try {
                        this.requisitions.push(this.requisitionParser.parse(data));
                    }
                    catch (err) {
                        logger_1.Logger.error(`Error parsing requisition ${JSON.stringify(err)}`);
                    }
                }
            });
        };
        this.requisitionParser = new requisition_parser_1.RequisitionParser();
        const watcher = chokidar.watch(fileNamePattern, { ignored: /(^|[\/\\])\../ });
        watcher.on("add", (path) => {
            this.pushRequisitionFile(path);
        });
    }
    receiveRequisition() {
        return new Promise((resolve, reject) => {
            var timer = setInterval(() => {
                if (this.ready) {
                    clearInterval(timer);
                    const content = this.requisitions.pop();
                    if (content)
                        return resolve(content);
                    else {
                        const message = "There is no more requisition file to be read";
                        logger_1.Logger.info(message);
                        return reject();
                    }
                }
            }, 100);
        });
    }
}
exports.SingleRunRequisitionInput = SingleRunRequisitionInput;
