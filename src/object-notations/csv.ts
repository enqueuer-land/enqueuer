import {ObjectNotation} from './object-notation';
import * as fs from 'fs';
import {ObjectDecycler} from './object-decycler';

export class Csv implements ObjectNotation {
    private readonly delimiter: string;
    private readonly header: boolean;

    public constructor(type: string = 'csvh') {
        this.delimiter = ';';
        if (type.toLowerCase().startsWith('tsv')) {
            this.delimiter = '\t';
        }
        this.header = type.toLowerCase().endsWith('h');
    }

    public parse(csvText: string): object {
        const lineSeparator = /\r?\n/;
        if (csvText.split) {
            const lines = csvText.split(lineSeparator);
            if (!this.header) {
                return lines
                    .filter(line => line.length > 0)
                    .map((line: string) => line.split(this.delimiter));
            } else if (lines[0]) {
                return this.parseWithHeader(lines);
            }
        }
        return [];
    }

    public stringify(value: any): string {
        if (!value) {
            return '{}';
        }
        const decycler = new ObjectDecycler('[CYCLIC REFERENCE]');

        if (this.header) {
            return this.stringifyWithHeader(value, decycler);
        } else {
            return value
                .map((row: string[]) => row
                    .map((value: any) => decycler.decycle(value))
                    .join(this.delimiter))
                .join('\r\n');
        }
    }

    private stringifyWithHeader(value: any, decycle: ObjectDecycler) {
        const title = Object.keys(value[0]);

        const csv = value
            .map((row: any) => title
                .map(fieldName => decycle.decycle(row[fieldName]))
                .join(this.delimiter));

        csv.unshift(title.join(this.delimiter));
        return csv.join('\r\n');
    }

    public loadFromFileSync(filename: string): object {
        return this.parse(fs.readFileSync(filename).toString());
    }

    private parseWithHeader(lines: string[]): object {
        let result: any = [];
        const headers = lines[0].split(this.delimiter);
        lines
            .filter((line, index) => line.length > 0 && index > 0)
            .forEach((currentLine: string) => {
                let parsedLine: any = {};
                currentLine.split(this.delimiter)
                    .forEach((value, valuesIndex) => {
                        parsedLine[headers[valuesIndex]] = value;
                    });
                result.push(parsedLine);
        });
        return result;
    }

}
