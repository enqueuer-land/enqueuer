import {exec} from 'child_process';
import {Logger} from '../loggers/logger';

export class Dependency {
    private readonly packageName: string;
    private readonly version: string;

    constructor(packageName: string, version: string) {
        this.packageName = packageName;
        this.version = version;
    }

    public getPackage(): string {
        return this.packageName;
    }

    public getVersion(): string {
        return this.version;
    }

    public install(): Promise<void> {
        Logger.info(`Installing ${this.display()} dependency`);
        return new Promise((resolve, reject) => {
            exec(`npm install ${this.display()}`,
                (error: any, stdout: string, stderr: string) => {
                if (error) {
                    Logger.error(`Error installing ${this.packageName}: ${stderr}`);
                    reject(error);
                } else {
                    Logger.info(`${this.packageName} installed`);
                    resolve();
                }
            });
        });
    }

    public display(): string {
        return `${this.packageName}@${this.version}`;
    }
}