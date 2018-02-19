import {RequisitionParserFactory} from './requisition-parser-factory';
import { expect } from 'chai';
import 'mocha';
import { MqttService } from '../mqtt-service';

describe('RequisitionParserFactory test', function() {
    it('mqtt protocol', function() {
        const factory: RequisitionParserFactory = new RequisitionParserFactory();
        const requisition = {
            protocol: "mqtt"
        }

        const service = factory.createService(requisition);
        expect(service).to.be.instanceOf(MqttService);
    });

    it('undefined protocol', function() {
        const factory: RequisitionParserFactory = new RequisitionParserFactory();
        const requisition = {
            protocol: "unknown"
        }

        expect(() => factory.createService(requisition)).to.throw;
    });
});
