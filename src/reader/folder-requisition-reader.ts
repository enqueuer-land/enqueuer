import { RequisitionReader } from "./requisition-reader";
import {Configuration} from "../conf/configuration";
import {FSWatcher} from "fs";
const fs = require("fs");
const hound = require('hound');
var dir = require('node-dir');


export class FolderRequisitionReader implements RequisitionReader {
    private watcher: FSWatcher;
    private files: string[] = [];

    constructor() {
        const folderName = Configuration.getRequisitionFolder();
        console.log(`Folder to watch: ${folderName}`);
        this.watcher = hound.watch(folderName);


        this.files = dir.files(folderName, {sync:true});
        // console.log(`${this.files} found`)
    }

    public start(): Promise<string> {
        console.log("Starting FolderRequisitionReader");
        return new Promise((resolve, reject) => {
            if (this.files.length > 0) {
                console.log(`FolderRequisitionReader got a requisition ${this.files}`);
                this.readFiles(this.files)
                    .then(fileContents => resolve(fileContents))
                    .catch(err => reject(err));
                this.files = [];
            }

            this.watcher.on('create', (fileName) => {
                console.log(`${fileName} created`)
                this.readFiles([fileName])
                    .then(fileContents => resolve(fileContents))
                    .catch(err => reject(err));
            });

            this.watcher.on('change', (fileName) => {
                console.log(`${fileName} changed`)
                this.readFiles([fileName])
                    .then(fileContents => resolve(fileContents))
                    .catch(err => reject(err));
            });

            this.watcher.on('error', (error) => reject(error));
        });
    }

    // function processQ() {
    //     // ... this will be called on each .push
    // }
    //
    // var myEventsQ = [];
    // myEventsQ.push = function() { Array.prototype.push.apply(this, arguments);  processQ();};


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