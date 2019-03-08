import prettyjson from 'prettyjson';
import {ReportFormatter} from '../outputs/formatters/report-formatter';
import {JsonReportFormatter} from '../outputs/formatters/json-formatter';
import {Logger} from '../loggers/logger';
import {getPrettyJsonConfig} from '../outputs/prettyjson-config';

interface AddedReportFormatter {
    tags: string[];
    createFunction: () => ReportFormatter;
}

//TODO test it
export class ReportFormatterManager {
    private formatters: AddedReportFormatter[] = [];

    public createReportFormatter(format: string): ReportFormatter {
        const matchingFormatters = this.formatters
            .filter((addedFormatter: AddedReportFormatter) => (addedFormatter.tags || [])
                .some((tag: string) => tag.toLowerCase() === format.toLowerCase()))
            .map((addedFormatter: AddedReportFormatter) => addedFormatter.createFunction());
        if (matchingFormatters.length > 0) {
            return matchingFormatters[0];
        }
        Logger.info(`No Report Formatter was found with '${format}', using default one`);
        return new JsonReportFormatter();
    }

    public addReportFormatter(createFunction: () => ReportFormatter, ...tags: string[]): void {
        this.formatters.push({tags, createFunction});
    }

    public describeReportFormatters(describeFormatters: string | true): boolean {
        const data = {
            formatters: this.formatters
                .filter((addedFormatter: AddedReportFormatter) => typeof (describeFormatters) === 'string' ? (addedFormatter.tags || [])
                    .some((tag: string) => tag.toLowerCase() === describeFormatters.toLowerCase()) : true)
                .map((formatter: AddedReportFormatter) => formatter.tags)
        };
        console.log(prettyjson.render(data, getPrettyJsonConfig()));
        return data.formatters.length > 0;
    }
}
