import {Subscription} from "./subscription";
import {Logger} from "../loggers/logger";
import {Injectable} from "../injector/injector";
import {SubscriptionModel} from "../requisitions/models/subscription-model";
const fs = require("fs");
const chokidar = require('chokidar');

@Injectable((subscriptionAttributes: any) => subscriptionAttributes.type === "file-name-watcher")
export class FileNameWatcherSubscription extends Subscription {

    private watcher: any;
    private fileNamePattern: string;
    private filesName: string[] = [];

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        this.fileNamePattern = subscriptionAttributes.fileNamePattern;
    }

    public connect(): Promise<void> {
        this.watcher = chokidar.watch(this.fileNamePattern, {ignored: /(^|[\/\\])\../});
        return new Promise((resolve) => {
            this.watcher.on('add', (fileName: string) => {
                Logger.trace(`${this.type} found file: ${fileName}`);
                this.filesName.push(fileName);
            });
            this.watcher.on('ready', () => {
                Logger.trace(`${this.type} is ready`);
                resolve()
            });
        })
    }

    public async receiveMessage(): Promise<string> {
        return this.popFileContent();
    }

    private popFileContent(): Promise<string> {
        return new Promise((resolve, reject) => {
            let interval = setInterval(() => {
                const pop = this.filesName.pop();
                if (pop)
                {
                    try {
                        resolve(fs.readFileSync(pop).toString());
                    }
                    catch (error) {
                        Logger.warning(`Error reading file ${JSON.stringify(error)}`)
                        reject(error);
                    }
                    clearInterval(interval);
                }
            }, 100);
        });
    }
}