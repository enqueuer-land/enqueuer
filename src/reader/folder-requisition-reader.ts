import { RequisitionReader } from "./requisition-reader";
import {Configuration} from "../conf/configuration";
import {FSWatcher} from "fs";
const fs = require("fs");
const chokidar = require('chokidar');

export class FolderRequisitionReader implements RequisitionReader {

    private files: string[] = [];
    private watcher: FSWatcher;
    private INTERVAL_CHECK: number = 1000;

    constructor() {
        let folderName = Configuration.getRequisitionFolder();
        if (!folderName.endsWith("/"))
            folderName = folderName.concat("/");

        folderName = folderName.concat("*.enq");
        console.log(`Folder to watch: ${folderName}`);

        this.watcher = chokidar.watch(folderName, {ignored: /(^|[\/\\])\../});
        this.watcher.on('add', path => this.files.push(path));
    }

    public start(): Promise<string> {
        console.log("Starting FolderRequisitionReader");
        return new Promise((resolve, reject) => {
            this.popFile()
                .then( fileContent => resolve(fileContent))
                .catch( err => reject(err));
            });
    }

    private popFile(): Promise<string> {
        return new Promise((resolve, reject) => {

            var timer = setInterval(() => {
                const file: string | undefined = this.files.pop();
                if (file) {
                    console.log(`Detected: ${file}`);

                    clearInterval(timer);
                    this.readFile(file)
                        .then(fileContent => resolve(fileContent))
                        .catch(err => reject(err));
                }
            }, this.INTERVAL_CHECK);
        });
    }

    private readFile(filename: string): Promise<string> {
        return new Promise((resolve, reject) => {
           fs.readFile(filename, (error: any, data: string) => {
               if (error)
                   reject(error);
               else {
                   resolve(data);
               }
           });
        });
    }
}