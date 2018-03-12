import {Publisher} from "./publisher";
import {Injectable} from "../injector/injector";
import {NullFactoryFunction} from "../injector/factory-function";

@Injectable(NullFactoryFunction)
export class NullPublisher extends Publisher {

    public publish(): Promise<void> {
        return Promise.reject(`Undefined publishing type to publish event: ${this.type}`);
    }

}