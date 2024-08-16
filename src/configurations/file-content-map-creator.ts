import { Logger } from '../loggers/logger';
import { RequisitionModel } from '../models/inputs/requisition-model';
import { DynamicModulesManager } from '../plugins/dynamic-modules-manager';
import * as fs from 'fs';
import { ObjectParser } from '../object-parser/object-parser';

export class FileContentMapCreator {
    private map: any = {};

    public constructor(value: RequisitionModel) {
        this.checkChildren(value);
    }

    public getMap(): {} {
        return this.map;
    }

    private checkChildren(node: any): void {
        for (const key in node) {
            const attribute = node[key];
            if (typeof attribute === 'object') {
                this.checkChildren(attribute);
            } else if (attribute !== undefined) {
                this.findTags(JSON.stringify(attribute));
            }
        }
    }

    private findTags(node: string) {
        const angleBrackets = /<<[\w\s]+:\/\/[^>>]+>>/g;
        const curlyBrackets = /{{[\w\s]+:\/\/[^}}]+}}/g;
        const curly: string[] = node.match(curlyBrackets) || [];
        const angle: string[] = node.match(angleBrackets) || [];
        angle.concat(...curly).forEach((value: string) => {
            const key: string = value.substring(2, value.length - 4);
            this.map[key] = this.insertIntoMap(key);
        });
    }

    private insertIntoMap(key: string): object | string {
        if (!this.map[key]) {
            try {
                const options = this.parsePlaceholder(key);
                const fileContent = fs.readFileSync(options.filename).toString();
                const objectParser = DynamicModulesManager.getInstance()
                    .getObjectParserManager()
                    .createParser(options.tag);
                if (objectParser !== undefined) {
                    Logger.trace(`Trying to parse content as '${options.tag}' parser`);
                    return this.getValue(objectParser, fileContent, options);
                }
                return fileContent;
            } catch (err) {
                Logger.warning('FileContentMapCreator: ' + err);
                return '' + err;
            }
        }
        return this.map[key];
    }

    private parsePlaceholder(key: string): {
        tag: string;
        filename: string;
        [propname: string]: string;
    } {
        const separator: string = '://';
        const separatorIndex = key.indexOf(separator);
        const tag = key.substring(0, separatorIndex);
        const afterDoubleSlash = key.substring(separatorIndex + 3);
        const parseQuery = this.parseQuery(afterDoubleSlash);
        parseQuery.tag = tag;
        return parseQuery;
    }

    private parseQuery(tag: string) {
        const strings = tag.split('?');
        const query: any = {
            filename: strings[0]
        };
        if (strings.length > 1) {
            const pairs = strings[1].split('&');
            for (let i = 0; i < pairs.length; i++) {
                const pair = pairs[i].split('=');
                let value: any = pair[1];
                if (value === undefined) {
                    value = true;
                }
                query[pair[0]] = value;
            }
        }
        return query;
    }

    private getValue(objectParser: ObjectParser, fileContent: string, query: any): object | string {
        try {
            return objectParser.parse(fileContent, query);
        } catch (err) {
            Logger.error('' + err);
            return fileContent;
        }
    }
}
