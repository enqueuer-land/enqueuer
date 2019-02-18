import {Subscription} from './subscription';
import {Logger} from '../loggers/logger';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import * as fs from 'fs';
import * as glob from 'glob';
import {MainInstance} from '../plugins/main-instance';
import {SubscriptionProtocol} from '../protocols/subscription-protocol';

class FileSystemWatcherSubscription extends Subscription {

    constructor(subscriptionAttributes: SubscriptionModel) {
        super(subscriptionAttributes);
        this.options = subscriptionAttributes.options || {nodir: true};
        if (!this.fileNamePattern) {
            throw new Error(`Impossible to create a ${this.type} with no 'fileNamePattern' field`);
        }
    }

    public subscribe(): Promise<void> {
        return Promise.resolve();
    }

    public async receiveMessage(): Promise<any> {
        return new Promise((resolve, reject) => {
            let interval = setInterval(() => {
                const files = glob.sync(this.fileNamePattern, this.options);
                if (files.length > 0) {
                    const filename = files[0];
                    try {
                        resolve(this.extractFileInformation(filename));
                    }
                    catch (error) {
                        Logger.warning(`Error reading file ${filename}: ${error}`);
                        reject(error);
                    }
                    clearInterval(interval);
                }
            }, 50);
        });
    }

    private extractFileInformation(filename: string) {
        const stat = fs.lstatSync(filename);
        return {
            content: fs.readFileSync(filename).toString(),
            name: filename,
            size: stat.size,
            modified: stat.mtime,
            created: stat.ctime
        };
    }
}

export function entryPoint(mainInstance: MainInstance): void {
    const protocol = new SubscriptionProtocol('file',
        (subscriptionModel: SubscriptionModel) => new FileSystemWatcherSubscription(subscriptionModel),
        ['content', 'name', 'size', 'modified', 'created'])
        .addAlternativeName('file-system-watcher', 'file-watcher');

    mainInstance.protocolManager.addProtocol(protocol);
}
