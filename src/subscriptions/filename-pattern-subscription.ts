import {Subscription} from "./subscription";
import {FSWatcher} from "fs";
import {Logger} from "../loggers/logger";
import {Injectable} from "../injector/injector";
import {SubscriptionModel} from "../requisitions/models/subscription-model";
const fs = require("fs");
const chokidar = require('chokidar');

@Injectable((subscriptionAttributes: any) => subscriptionAttributes.type === "file-name-pattern")
export class FileNamePatternSubscription extends Subscription {

    private checkIntervalMs: number;
    private files: string[] = [];
    private watcher: FSWatcher;
    private fileNamePattern: string;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);

        this.fileNamePattern = subscriptionAttributes.fileNamePattern;
        this.checkIntervalMs = subscriptionAttributes.checkIntervalMs;
        this.watcher = chokidar.watch(this.fileNamePattern, {ignored: /(^|[\/\\])\../});
    }

    public connect(): Promise<void> {
        this.watcher.on('add', path => this.files.push(path));
        this.watcher.on('change', path => this.files.push(path));
        return Promise.resolve();
    }

    public receiveMessage(): Promise<string> {
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
                    Logger.debug(`FileNamePattern subscription detected file: ${file}`);

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