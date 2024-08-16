import { Logger } from '../loggers/logger';
import { RequisitionModel } from '../models/outputs/requisition-model';
import { PublisherModel } from '../models/inputs/publisher-model';
import { Publisher } from '../publishers/publisher';
import { ReportFormatter } from './formatters/report-formatter';
import { DynamicModulesManager } from '../plugins/dynamic-modules-manager';

export class MultiTestsOutput {
    private outputs: Publisher[] = [];

    public constructor(outputs: PublisherModel[]) {
        (outputs || []).forEach((output: PublisherModel) => {
            Logger.debug(`Instantiating output '${output.type}' and format '${output.format}'`);
            const publisher = DynamicModulesManager.getInstance().getProtocolManager().createPublisher(output);
            publisher.formatter = DynamicModulesManager.getInstance()
                .getReportFormatterManager()
                .createReportFormatter(output.format);
            publisher.format = output.format;
            this.outputs.push(publisher);
        });
    }

    public async publishReport(report: RequisitionModel) {
        await Promise.all(
            this.outputs.map(publisher => {
                try {
                    const formatter = publisher.formatter as ReportFormatter;
                    Logger.trace(`Formatting as ${publisher.format}`);
                    publisher.payload = formatter.format(report);
                    return publisher.publish();
                } catch (err) {
                    Logger.warning(`Error publishing report: ${JSON.stringify(report)}: ${err}`);
                }
            })
        );
    }
}
