import { PublisherModel } from '../models/inputs/publisher-model';
import { YmlObjectParser } from '../object-parser/yml-object-parser';
import * as fs from 'fs';

export class FileConfiguration {
  private readonly parsedFile: any;

  public constructor(filename: string) {
    try {
      const fileContent = fs.readFileSync(filename.trim()).toString();
      const ymlObjectParser = new YmlObjectParser();
      this.parsedFile = ymlObjectParser.parse(fileContent);
    } catch (err) {
      throw `Error loading configuration file: ${err}`;
    }
  }

  public getLogLevel(): string {
    return this.parsedFile['log-level'];
  }

  public getOutputs(): PublisherModel[] {
    return this.parsedFile.outputs || [];
  }

  public getStore(): any {
    return this.parsedFile.store || {};
  }

  public getPlugins(): string[] {
    return this.parsedFile.plugins || [];
  }

  public isParallelExecution(): boolean {
    return !!this.parsedFile.parallel;
  }

  public getFiles(): string[] {
    return this.parsedFile.files || [];
  }

  public getMaxReportLevelPrint(): number {
    return this.parsedFile.maxReportLevelPrint;
  }
}
