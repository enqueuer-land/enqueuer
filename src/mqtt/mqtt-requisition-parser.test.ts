import { MqttRequisitionFileParser } from './mqtt-requisition-file-parser';
import { expect } from 'chai';
import 'mocha';
import { Subscription } from './mqtt-requisition-file';

describe('MqttRequisitionFile test', function() {
    describe('Constructor', function() {
        const mqttRequisitionFileParser = new MqttRequisitionFileParser();
        const filename = "resources/test/mqtt-test.json";

        it('should raise exception if file does not exist', function() {
            const nonExistentFile = "nonExistentFile";

            expect(() => mqttRequisitionFileParser.parse(nonExistentFile)).to.throw();
        });

        it('should parse all subscriptions', function() {
            const mqttRequisitionFile = mqttRequisitionFileParser.parse(filename);
            const expectedSubscriptions = [
                {
                    timeout: 2000,
                    topic: "1"
                },
                {
                    timeout: 3000,
                    topic: "2/#"
                }];

            const actualSubscriptions = mqttRequisitionFile.subscriptions;
            for (let index: number = 0; index < actualSubscriptions.length; ++index) {
                expect(actualSubscriptions[index].topic).to.be.equal(expectedSubscriptions[index].topic);
            }
            expect(actualSubscriptions.length).to.be.equal(expectedSubscriptions.length);
        });

        it('should parse all subscriptions test functions', function() {
            const mqttRequisitionFile = mqttRequisitionFileParser.parse(filename);
            const response = {attribute:"attribute"};
            
            
            for (let index: number = 0; index < mqttRequisitionFile.subscriptions.length; ++index) {
                let subscription = mqttRequisitionFile.subscriptions[index];
                let func = subscription.createTestFunction();
                if (func) {
                    const test = {
                        value: false
                    }
                    const functionResponse = func(response);
                    expect(functionResponse).to.deep.equal(test);
                }
            }
        });

        it('should parse topicToPublish', function() {
            const mqttRequisitionFile = mqttRequisitionFileParser.parse(filename);

            const actualTopic = mqttRequisitionFile.publish.topic;
            const expectedTopic = "topicToPublish";
            expect(actualTopic).to.be.equal(expectedTopic);
        });

        it('should parse topicToPublish', function() {
            const mqttRequisitionFile = mqttRequisitionFileParser.parse("resources/test/mqtt-no-publish.json");

            expect(mqttRequisitionFile.publish).to.be.null;
        });

        it('should parse brokerAddress', function() {
            const mqttRequisitionFile = mqttRequisitionFileParser.parse(filename);

            const actualBrokerAddress = mqttRequisitionFile.brokerAddress;
            const expectedBrokerAddress = "brokerAddress";
            expect(actualBrokerAddress).to.be.equal(expectedBrokerAddress);
        });

    });
});