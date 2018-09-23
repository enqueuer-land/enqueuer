import {JavascriptObjectNotation} from '../object-notations/javascript-object-notation';
import {YamlObjectNotation} from '../object-notations/yaml-object-notation';
import * as fs from 'fs';

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

    private checkChildren = (node: any) => {
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

    private insertIntoMap(tag: string) {
        if (!this.map[tag]) {
            const filename = tag.substring(tag.indexOf('://') + 3);
            if (tag.startsWith('json://')) {
                this.map[tag] = new JavascriptObjectNotation().loadFromFileSync(filename);
            } else if (tag.startsWith('yaml://')) {
                this.map[tag] = new YamlObjectNotation().loadFromFileSync(filename);
            } else {
                this.map[tag] = fs.readFileSync(filename).toString();
            }
        }
    }

}