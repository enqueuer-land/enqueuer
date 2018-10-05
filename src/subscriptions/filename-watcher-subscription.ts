import {Subscription} from './subscription';
import {Logger} from '../loggers/logger';
import {SubscriptionModel} from '../models/inputs/subscription-model';
import {Injectable} from 'conditional-injector';
import * as fs from 'fs';
import * as glob from 'glob';
import {ProtocolManager} from '../configurations/protocol-manager';

const protocol = ProtocolManager.getInstance()
    .insertSubscriptionProtocol('file',
        ['file-system-watcher', 'file-watcher']);
@Injectable({predicate: (publish: any) => protocol.matchesRatingAtLeast(publish.type, 95)})
export class FileSystemWatcherSubscription extends Subscription {

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
        const message = {
            content: fs.readFileSync(filename).toString(),
            name: filename,
            size: stat.size,
            modified: stat.mtime,
            created: stat.ctime
        };
        return message;
    }
}