import { RequisitionReader } from "./requisition-reader";
import {Configuration} from "../conf/configuration";
const fs = require("fs");

export class FileRequisitionReader implements RequisitionReader {
    public start(): Promise<string> {
        console.log("Starting FileRequisitionReader");
        return new Promise((resolve, reject) => {
            const filename = Configuration.getInputRequisitionFileName();
            if (!filename)
                reject("Filename not specified");
            fs.readFile(filename, (error: any, data: string) => {
                if (error)
                    reject(error);
                else {
                    console.log("FileRequisitionReader got a requisition");
                    resolve(data);
                }
            });
        });

    }
}