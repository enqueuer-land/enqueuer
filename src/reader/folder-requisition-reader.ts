import { RequisitionReader } from "./requisition-reader";
import {Configuration} from "../conf/configuration";
import {FSWatcher} from "fs";
const fs = require("fs");
const chokidar = require('chokidar');

export class FolderRequisitionReader implements RequisitionReader {

    private INTERVAL_CHECK: number = 1000;
    private files: string[] = [];
    private watcher: FSWatcher;
    private folderName: string;

    constructor() {
        this.folderName = Configuration.getWatchFolder();
        this.watcher = chokidar.watch(this.folderName, {ignored: /(^|[\/\\])\../});
        this.watcher.on('add', path => this.files.push(path));
    }

    public start(): Promise<string> {
        console.log(`Starting FolderRequisitionReader:\t${this.folderName}`);

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