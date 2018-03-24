import {Logger} from "../loggers/logger";
import {RequisitionParser} from "./requisition-parser";
import {RequisitionModel} from "./models/requisition-model";

const chokidar = require('chokidar');
const fs = require("fs");

export class SingleRunRequisitionInput {

    private requisitions: RequisitionModel[] = [];
    private requisitionParser: RequisitionParser;
    private ready: boolean = false;

    constructor(fileNamePattern: string) {
        this.requisitionParser = new RequisitionParser();
        const watcher = chokidar.watch(fileNamePattern, {ignored: /(^|[\/\\])\../});
        watcher.on("add", (path: string) => {
            this.pushRequisitionFile(path);
        })
    }

    public receiveRequisition(): Promise<RequisitionModel> {
        return new Promise((resolve, reject) => {
            var timer = setInterval(() => {
                if (this.ready) {
                    clearInterval(timer);
                    const content = this.requisitions.pop();
                    if (content)
                        return resolve(content);
                    else
                        {
                            const message = "There is no more requisition files to be read";
                            Logger.info(message);
                            return reject();
                        }
                }
            }, 100);
        })
    }

    private pushRequisitionFile = (fileName: string): void => {
        this.ready = true;
        Logger.info(`Found requisition file: ${fileName}`)
        fs.readFile(fileName, (error: any, data: string) => {
            if (error)
                Logger.warning(`Error reading file ${JSON.stringify(error)}`)
            else {
                try {
                    this.requisitions.push(this.requisitionParser.parse(data));
                }
                catch(err) {
                    Logger.error(`Error parsing requisition ${JSON.stringify(err)}`)
                }
            }
        });
    }

}