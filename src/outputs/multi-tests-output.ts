import {SummaryTestOutput} from './summary-test-output';
import {Logger} from '../loggers/logger';
import {RequisitionModel} from '../models/outputs/requisition-model';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Publisher} from '../publishers/publisher';
import {ReportFormatter} from './formatters/report-formatter';
import chalk from 'chalk';
import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';

export class MultiTestsOutput {
    private outputs: Publisher[] = [];

    public constructor(outputs: PublisherModel[]) {
        (outputs || []).forEach((output: PublisherModel) => {
            Logger.debug(`Instantiating output '${output.type}' and format '${output.format}'`);
            const publisher = DynamicModulesManager.getInstance()
                .getProtocolManager().createPublisher(output);
            publisher.formatter = DynamicModulesManager.getInstance()
                .getReportFormatterManager().createReportFormatter(output.format);
            publisher.format = output.format;
            this.outputs.push(publisher);
        });
    }

    public async execute(report: RequisitionModel) {
        console.log(chalk.white(`------------------------------`));
        new SummaryTestOutput(report).print();

        await Promise.all(this.outputs
            .map(publisher => {
                const formatter = publisher.formatter as ReportFormatter;
                Logger.trace(`Formatting as ${publisher.format}`);
                publisher.payload = formatter.format(report);
                return publisher.publish();
            }));
    }
}
