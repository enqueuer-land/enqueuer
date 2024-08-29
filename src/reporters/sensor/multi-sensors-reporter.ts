import * as input from '../../models/inputs/sensor-model';
import * as output from '../../models/outputs/sensor-model';
import { SensorReporter } from './sensor-reporter';
import { Logger } from '../../loggers/logger';
import { ComponentImporter } from '../../task-runners/component-importer';

export class MultiSensorsReporter {
  private sensors: SensorReporter[] = [];
  private timeoutPromise: Promise<any>;

  constructor(sensors: input.SensorModel[]) {
    Logger.debug(`Instantiating sensors`);
    this.sensors = sensors.map(sensor => new SensorReporter(new ComponentImporter().importSensor(sensor)));
    this.timeoutPromise = Promise.resolve();
  }

  public start(): void {
    this.timeoutPromise = new Promise(resolve => {
      this.sensors.forEach(sensor => {
        sensor.startTimeout(() => {
          if (this.sensors.every(sensor => sensor.hasFinished())) {
            const message = `Every sensor has finished its job`;
            Logger.debug(message);
            resolve(message);
          }
        });
      });
    });
  }

  public async mount(): Promise<any> {
    Logger.debug(`Sensors are getting ready`);
    return Promise.race([
      Promise.all(
        this.sensors.map(async sensor => {
          try {
            await sensor.mount();
          } catch (err) {
            Logger.error(`Error getting ready: ${err}`);
          }
        })
      ),
      this.timeoutPromise
    ]);
  }

  public async receiveMessage(): Promise<void> {
    Logger.debug(`Sensors are waiting for messages`);
    await Promise.race([
      Promise.all(
        this.sensors.map(async sensor => {
          try {
            await sensor.receiveMessage();
            Logger.debug(`A sensor received a message`);
          } catch (err) {
            Logger.error(`Error receiving message: ${err}`);
          }
        })
      ),
      this.timeoutPromise
    ]);

    Logger.debug(`Sensors are no longer waiting for messages`);
  }

  public async unmount(): Promise<void[]> {
    Logger.debug(`Sensors are closing`);
    return await Promise.all(this.sensors.map(sensor => sensor.unmount()));
  }

  public getReport(): output.SensorModel[] {
    return this.sensors.map(sensor => sensor.getReport());
  }

  public onFinish(): void {
    this.sensors.forEach(sensorHandler => sensorHandler.onFinish());
  }
}
