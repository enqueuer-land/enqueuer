import {Subscription} from "./subscription";
import {Logger} from "../loggers/logger";
import {Injectable} from "../injector/injector";
import {SubscriptionModel} from "../requisitions/models/subscription-model";
const fs = require("fs");
const chokidar = require('chokidar');

@Injectable((subscriptionAttributes: any) => subscriptionAttributes.type === "file-name-watcher")
export class FileNameWatcherSubscription extends Subscription {

    private error: any = null;
    private checkIntervalMs: number;
    private watchedFileContent: string[] = [];
    private fileNamePattern: string;

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);

        this.fileNamePattern = subscriptionAttributes.fileNamePattern;
        this.checkIntervalMs = subscriptionAttributes.checkIntervalMs || 50;
    }

    public connect(): Promise<void> {
        const watcher = chokidar.watch(this.fileNamePattern, {ignored: /(^|[\/\\])\../});
        watcher.on('add', (path: string) => this.pushFileContent(path));
        watcher.on('change', (path: string) => this.pushFileContent(path));
        return Promise.resolve();
    }

    public receiveMessage(): Promise<string> {
        return new Promise((resolve, reject) => {
            var timer = setInterval(() => {
                if (this.error)
                    return reject(this.error);
                if (this.watchedFileContent.length > 0) {
                    clearInterval(timer);
                    const content = this.watchedFileContent.pop();
                    if (content)
                        return resolve(content);
                    else
                    {
                        return reject();
                    }
                }
            }, this.checkIntervalMs);
        })
    }

    private pushFileContent = (fileName: string): void => {
        Logger.info(`${this.type} found: ${fileName}`)
        fs.readFile(fileName, (error: any, data: Buffer) => {
            if (error) {
                this.error = error;
                Logger.warning(`Error reading file ${JSON.stringify(error)}`)
            }
            else {
                    this.watchedFileContent.push(data.toString());
            }
        });
    }
}