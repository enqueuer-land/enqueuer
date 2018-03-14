import {Publisher} from "./publisher";
import {Injectable} from "../injector/injector";
import {NullFactoryPredicate} from "../injector/factory-predicate";

@Injectable(NullFactoryPredicate)
export class NullPublisher extends Publisher {

    public publish(): Promise<void> {
        return Promise.reject(`Undefined publishing type to publish event: ${this.type}`);
    }

}