import {JavascriptObjectNotation} from '../object-notations/javascript-object-notation';
import {YamlObjectNotation} from '../object-notations/yaml-object-notation';
import {DelimiterSeparatedValueObjectNotation} from '../object-notations/delimiter-separated-value-object-notation';
import * as fs from 'fs';
import {Logger} from '../loggers/logger';

export class FileContentMapCreator {

    private map: any = {};

    public createMap(value: object | string) {
        if (typeof value == 'string') {
            this.checkChildren(new JavascriptObjectNotation().parse(value as string));
        } else {
            this.checkChildren(value);
        }
    }

    public getMap(): {} {
        return this.map;
    }

    private checkChildren(node: any): void {
        for (const key in node) {
            const attribute = node[key];
            if (typeof attribute == 'object') {
                this.checkChildren(attribute);
            } else {
                this.replaceValue(attribute.toString());
            }
        }
    }

    private replaceValue(node: string) {
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
                const separator = key.indexOf('://');
                const tag = key.substring(0, separator);
                const filename = key.substring(separator + 3);
                switch (tag) {
                    case 'json': this.map[key] = new JavascriptObjectNotation().loadFromFileSync(filename); break;
                    case 'yml': this.map[key] = new YamlObjectNotation().loadFromFileSync(filename); break;
                    case 'yaml': this.map[key] = new YamlObjectNotation().loadFromFileSync(filename); break;
                    case 'csv': this.map[key] = new DelimiterSeparatedValueObjectNotation().loadFromFileSync(filename); break;
                    case 'tsv': this.map[key] = new DelimiterSeparatedValueObjectNotation('\t').loadFromFileSync(filename); break;
                    default: this.map[key] = fs.readFileSync(filename).toString();
                }
            }
        } catch (err) {
            Logger.warning(err.toString());
            this.map[key] = err.toString();
        }
    }

}