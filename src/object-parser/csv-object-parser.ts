import { ObjectParser } from './object-parser';
import { ObjectDecycler } from './object-decycler';
import { MainInstance } from '../plugins/main-instance';

export class CsvObjectParser implements ObjectParser {
  public parse(text: string, query: any = {}): object {
    const { header, delimiter } = this.parseQuery(query);
    const lineSeparator = /\r?\n/;
    if (text.split) {
      const lines = text.split(lineSeparator);
      if (!header) {
        return lines.filter(line => line.length > 0).map((line: string) => line.split(delimiter));
      } else if (lines[0]) {
        return this.parseWithHeader(lines, delimiter);
      }
    }
    return [];
  }

  public stringify(value: any, query: any = {}): string {
    const { header, delimiter } = this.parseQuery(query);
    if (!value) {
      return '{}';
    }
    const decycler = new ObjectDecycler('[CYCLIC REFERENCE]');

    if (header) {
      return this.stringifyWithHeader(value, decycler, delimiter);
    } else {
      return value
        .map((row: string[]) => row.map((value: any) => decycler.decycle(value)).join(delimiter))
        .join('\r\n');
    }
  }

  private parseQuery(query: any) {
    return Object.assign(
      {},
      {
        header: true,
        delimiter: ';'
      },
      query
    );
  }

  private stringifyWithHeader(value: any, decycle: ObjectDecycler, delimiter: string) {
    const title = Object.keys(value[0]);

    const csv = value.map((row: any) => title.map(fieldName => decycle.decycle(row[fieldName])).join(delimiter));

    csv.unshift(title.join(delimiter));
    return csv.join('\r\n');
  }

  private parseWithHeader(lines: string[], delimiter: string): object {
    let result: any = [];
    const headers = lines[0].split(delimiter);
    lines
      .filter((line, index) => line.length > 0 && index > 0)
      .forEach((currentLine: string) => {
        let parsedLine: any = {};
        currentLine.split(delimiter).forEach((value, valuesIndex) => {
          parsedLine[headers[valuesIndex]] = value;
        });
        result.push(parsedLine);
      });
    return result;
  }
}

export function entryPoint(mainInstance: MainInstance): void {
  mainInstance.objectParserManager.addObjectParser(() => new CsvObjectParser(), 'csv');
}
