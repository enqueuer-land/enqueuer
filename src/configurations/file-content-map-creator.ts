import {Logger} from '../loggers/logger';
import {RequisitionModel} from '../models/inputs/requisition-model';
import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';
import * as fs from 'fs';
import {ObjectParser} from '../object-parser/object-parser';

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
            } else {
                this.findTags(JSON.stringify(attribute));
            }
        }
    }

    private findTags(node: string) {
        const angleBrackets = /<<[\w\s]+:\/\/[^>>]+>>/g;
        const curlyBrackets = /{{[\w\s]+:\/\/[^}}]+}}/g;
        const match = (node.match(angleBrackets) || []).concat(node.match(curlyBrackets) || []);
        match.forEach((value: string) => {
            const key: string = value.substr(2, value.length - 4);
            this.map[key] = this.insertIntoMap(key);
        });
    }

    private insertIntoMap(key: string): object | string {
        if (!this.map[key]) {
            try {
                const query = this.parsePlaceHolder(key);
                const fileContent = fs.readFileSync(query.filename).toString();
                const objectParser = DynamicModulesManager.getInstance().getObjectParserManager().createParser(query.tag);
                if (objectParser !== undefined) {
                    return this.getValue(objectParser, fileContent, query);
                }
                return fileContent;
            } catch (err) {
                Logger.warning(err.toString());
                return err.toString();
            }
        }
        return this.map[key];
    }

    private parsePlaceHolder(key: string) {
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
                query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
            }
        }
        return query;
    }

    private getValue(objectParser: ObjectParser, fileContent: string, query: any): object | string {
        try {
            return objectParser.parse(fileContent, query);
        } catch (err) {
            Logger.error(err.toString());
            return fileContent;
        }
    }
}
