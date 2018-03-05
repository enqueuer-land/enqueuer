import {Subscription} from "./subscription";
import {FSWatcher} from "fs";
import {Logger} from "../log/logger";
const fs = require("fs");
const chokidar = require('chokidar');

export class FolderSubscription extends Subscription {

    private checkIntervalMs: number;
    private files: string[] = [];
    private watcher: FSWatcher;
    private folderName: string;

    constructor(subscriptionAttributes: any) {
        super(subscriptionAttributes);

        this.folderName = subscriptionAttributes.folderName;
        this.checkIntervalMs = subscriptionAttributes.checkIntervalMs;
        this.watcher = chokidar.watch(this.folderName, {ignored: /(^|[\/\\])\../});
    }

    public connect(): Promise<void> {
        this.watcher.on('add', path => this.files.push(path));
        this.watcher.on('change', path => this.files.push(path));
        return Promise.resolve();
    }

    public receiveMessage(): Promise<string> {
        Logger.info(`Starting FolderRequisitionReader:\t${this.folderName}`);

        return new Promise((resolve, reject) => {
            this.popFileContent()
                .then( fileContent => resolve(fileContent))
                .catch( err => reject(err));
            });
    }

    private popFileContent(): Promise<string> {
        return new Promise((resolve, reject) => {
            var timer = setInterval(() => {
                const file: string | undefined = this.files.pop();
                if (file) {
                    Logger.debug(`Folder subscription detected file: ${file}`);

                    clearInterval(timer);
                    this.readFile(file)
                        .then(fileContent => resolve(fileContent))
                        .catch(err => reject(err));
                }
            }, this.checkIntervalMs);
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