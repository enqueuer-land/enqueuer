import {Publisher} from "./publisher";
import {Logger} from "../log/logger";
var amqp = require('amqp');

export class AmqpPublisher extends Publisher {
    private connection: any;
    private url: string;
    private exchangeName: string;
    private routingKey: string;
    private exchangeOptions: {};
    private messageOptionsOptions: {};

    constructor(publish: any) {
        super(publish);
        this.url = publish.url;
        this.exchangeName = publish.exchangeName;
        this.routingKey = publish.routingKey;
        this.exchangeOptions = publish.exchangeOptions;
        this.messageOptionsOptions = publish.messageOptionsOptions;
    }

    public publish(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection = amqp.createConnection({url: this.url});
            this.connection.on('ready', () => {
                Logger.debug("Connected");
                // this.connection.publish(this.routingKey, this.payload, this.messageOptionsOptions, () => {
                //     Logger.debug("Publishing");
                //     // this.connection.end();
                //     // exchange.destroy();
                //     Logger.debug("Publishing");
                //     this.connection.disconnect();
                //     Logger.debug("Publishing");
                //     resolve();
                // });

                const exchange = this.connection.exchange("NOVA");
                Logger.debug(`Exchange created ${exchange}`);
                exchange.publish("ROTA", this.payload);

                    Logger.debug("Published");
                    // this.connection.end();
                    // exchange.destroy();
                    Logger.debug("Des");
                    this.connection.disconnect();
                    Logger.debug("Dis");
                    resolve();
            })
            this.connection.on('error', () => reject(this.connection.disconnect()));

        });
    }

}