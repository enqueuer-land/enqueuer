import { expect } from 'chai';
import 'mocha';
import { Subscription } from './mqtt-requisition';

describe('MqttRequisition test', function() {
    describe('Subscription test', function() {

        it('should createTestFunction', function() {
            const subscription: Subscription = new Subscription();
            const payload = 0;
            subscription.onMessageReceived = "test['description'] = 'test'; test['payload'] = ++payload";

            const testFunction: Function | null = subscription.createTestFunction();
            if (testFunction) {
                const testResult = testFunction(payload);
                expect(testResult.description).to.be.equal('test');
                expect(testResult.payload).to.be.equal(payload + 1);
            }
        });
    });
});