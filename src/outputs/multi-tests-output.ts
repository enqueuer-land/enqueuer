import {SummaryTestOutput} from './summary-test-output';
import {Logger} from '../loggers/logger';
import {RequisitionModel} from '../models/outputs/requisition-model';
import {PublisherModel} from '../models/inputs/publisher-model';
import {Container} from 'conditional-injector';
import {Publisher} from '../publishers/publisher';
import {Formatter} from './formatters/formatter';
import chalk from 'chalk';
import {ProtocolManager} from '../protocols/protocol-manager';

export class MultiTestsOutput {
    private outputs: Publisher[] = [];

    public constructor(outputs: PublisherModel[]) {
        (outputs || []).forEach((output: PublisherModel) => {
            Logger.debug(`Instantiating output '${output.type}' and format '${output.format}'`);
            const publisher = new ProtocolManager().init().createPublisher(output);
            publisher.formatter = Container.subclassesOf(Formatter).create(output);
            publisher.format = output.format;
            this.outputs.push(publisher);
        });
    }

    public async execute(report: RequisitionModel) {
        console.log(chalk.white(`------------------------------`));
        new SummaryTestOutput(report).print();

        await Promise.all(this.outputs
            .map(publisher => {
                const formatter = publisher.formatter as Formatter;
                Logger.trace(`Formatting as ${publisher.format}`);
                publisher.payload = formatter.format(report);
                return publisher.publish();
            }));
    }
}
