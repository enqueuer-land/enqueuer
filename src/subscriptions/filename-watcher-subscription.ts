import {Subscription} from './subscription';
import {Logger} from '../loggers/logger';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import * as fs from 'fs';
import * as chokidar from 'chokidar';

@Injectable({predicate: (subscriptionAttributes: any) => subscriptionAttributes.type === 'file-name-watcher'})
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
                resolve();
            });
        });
    }

    public async receiveMessage(): Promise<string> {
        return this.popFileContent();
    }

    private popFileContent(): Promise<string> {
        return new Promise((resolve, reject) => {
            let interval = setInterval(() => {
                const pop = this.filesName.shift();
                if (pop) {
                    try {
                        resolve(fs.readFileSync(pop).toString());
                    }
                    catch (error) {
                        Logger.warning(`Error reading file ${JSON.stringify(error)}`);
                        reject(error);
                    }
                    clearInterval(interval);
                }
            }, 100);
        });
    }
}