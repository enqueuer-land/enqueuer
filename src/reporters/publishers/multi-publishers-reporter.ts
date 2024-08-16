import { PublisherReporter } from './publisher-reporter';
import * as output from '../../models/outputs/publisher-model';
import * as input from '../../models/inputs/publisher-model';
import { Logger } from '../../loggers/logger';
import { ComponentImporter } from '../../requisition-runners/component-importer';

export class MultiPublishersReporter {
  private publishers: PublisherReporter[];

  constructor(publishers: input.PublisherModel[]) {
    Logger.debug(`Instantiating publishers`);
    this.publishers = publishers.map(
      publisher => new PublisherReporter(new ComponentImporter().importPublisher(publisher))
    );
  }

  public async publish(): Promise<void> {
    if (this.publishers.length > 0) {
      Logger.debug(`Publishers are publishing messages`);

      await Promise.all(
        this.publishers.map(async publisher => {
          try {
            await publisher.publish();
          } catch (err) {
            Logger.error(`Publishers errored: ` + err);
          }
        })
      );
      Logger.debug(`Publishers have published their messages`);
    }
  }

  public onFinish(): void {
    //sync forEach
    this.publishers.map(publisher => publisher.onFinish());
  }

  public getReport(): output.PublisherModel[] {
    return this.publishers.map(publisher => publisher.getReport());
  }
}
