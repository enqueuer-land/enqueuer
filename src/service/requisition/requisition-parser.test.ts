import {RequisitionParser} from './requisition-parser';
import { expect } from 'chai';
import 'mocha';

describe('RequisitionParser test', function() {
    it('mqtt protocol', function() {
        const factory: RequisitionParser = new RequisitionParser();
        const requisition = {
            protocol: "mqtt"
        }

        // const service = factory.createService(requisition);
        // expect(service).to.be.instanceOf(MqttService);
    });

    it('undefined protocol', function() {
        const factory: RequisitionParser = new RequisitionParser();
        const requisition = {
            protocol: "unknown"
        }

        // expect(() => factory.createService(requisition)).to.throw;
    });
});
