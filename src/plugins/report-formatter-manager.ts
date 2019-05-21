import prettyjson from 'prettyjson';
import {ReportFormatter} from '../outputs/formatters/report-formatter';
import {JsonReportFormatter} from '../outputs/formatters/json-formatter';
import {Logger} from '../loggers/logger';
import {getPrettyJsonConfig} from '../outputs/prettyjson-config';

interface AddedReportFormatter {
    tags: string[];
    createFunction: () => ReportFormatter;
}

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
        Logger.error(`No report formatter was found with '${format}', using default one`);
        return new JsonReportFormatter();
    }

    public addReportFormatter(createFunction: () => ReportFormatter, firstTag: string, ...tags: string[]): void {
        this.formatters.push({tags: [firstTag].concat(tags), createFunction});
    }

    public getMatchingReportFormatters(describeFormatters: string | true): { formatters: string[][] } {
        return {
            formatters: this.formatters
                .filter((addedFormatter: AddedReportFormatter) => typeof (describeFormatters) === 'string' ? (addedFormatter.tags || [])
                    .some((tag: string) => tag.toLowerCase() === describeFormatters.toLowerCase()) : true)
                .map((formatter: AddedReportFormatter) => formatter.tags)
        };
    }

    public describeMatchingReportFormatters(describeFormatters: string | true): boolean {
        const matchingReportFormatters = this.getMatchingReportFormatters(describeFormatters);
        console.log(prettyjson.render(matchingReportFormatters, getPrettyJsonConfig()));
        return matchingReportFormatters.formatters.length > 0;
    }
}
