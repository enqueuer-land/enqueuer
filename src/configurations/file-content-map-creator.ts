import * as fs from 'fs';
import {Logger} from '../loggers/logger';
import {Json} from '../object-notations/json';
import {RequisitionModel} from '../models/inputs/requisition-model';
import {ObjectNotationFactory} from '../object-notations/object-notation-factory';

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
                this.findTags(new Json().stringify(attribute));
            }
        }
    }

    private findTags(node: string) {
        const angleBrackets = /<<[\w\s]+:\/\/[^>>]+>>/g;
        const curlyBrackets = /{{[\w\s]+:\/\/[^}}]+}}/g;
        const match = (node.match(angleBrackets) || []).concat(node.match(curlyBrackets) || []);
        match.forEach((value: string) => {
            const key: string = value.substr(2, value.length - 4);
            this.insertIntoMap(key);
        });
    }

    private insertIntoMap(key: string) {
        try {
            if (!this.map[key]) {
                const separator: string = '://';
                const separatorIndex = key.indexOf(separator);
                const tag = key.substring(0, separatorIndex);
                const filename = key.substring(separatorIndex + 3);
                const objectNotation = new ObjectNotationFactory().create(tag);
                if (objectNotation) {
                    this.map[key] = objectNotation.loadFromFileSync(filename);
                } else {
                    this.map[key] = fs.readFileSync(filename).toString();
                }
            }
        } catch (err) {
            Logger.warning(err.toString());
            this.map[key] = err.toString();
        }
    }

}
