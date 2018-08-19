import {RunnableParser} from '../runnables/runnable-parser';
import * as glob from 'glob';
import * as fs from 'fs';
import {Logger} from '../loggers/logger';

export class SingleRunInput {

    private filesName: string[] = [];

    constructor(singleRunConfiguration: any) {
        singleRunConfiguration.files.forEach((file: string) => {
            this.filesName = this.filesName.concat(glob.sync(file));
        });
        Logger.info(`Files list: ${this.filesName}`);
    }

    public getRequisitionsRunnables(): any {
        const runnableParser: RunnableParser = new RunnableParser();
        let result: any = [];
         this.filesName.map(fileName => {
            try {
                result.push({name: fileName, content: runnableParser.parse(fs.readFileSync(fileName).toString())});
            } catch (err) {
                Logger.error(`Error parsing ${fileName}: ` + err);
            }
         });
         return result;
    }

}