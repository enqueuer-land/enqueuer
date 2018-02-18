import { MqttRequisitionFileParser } from './mqtt-requisition-file-parser';
import { expect } from 'chai';
import 'mocha';
import { Subscriptions } from './mqtt-requisition-file';

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

        it('should parse topicToPublish', function() {
            const mqttRequisitionFile = mqttRequisitionFileParser.parse(filename);

            const actualTopic = mqttRequisitionFile.publish.topic;
            const expectedTopic = "topicToPublish";
            expect(actualTopic).to.be.equal(expectedTopic);
        });

        it('should parse brokerAddress', function() {
            const mqttRequisitionFile = mqttRequisitionFileParser.parse(filename);

            const actualBrokerAddress = mqttRequisitionFile.brokerAddress;
            const expectedBrokerAddress = "brokerAddress";
            expect(actualBrokerAddress).to.be.equal(expectedBrokerAddress);
        });

        it('should parse totalTimeout', function() {
            const mqttRequisitionFile = mqttRequisitionFileParser.parse(filename);

            const actualTotalTimeout = mqttRequisitionFile.totalTimeout;
            const expectedTotalTimeout = 5000;
            expect(actualTotalTimeout).to.be.equal(expectedTotalTimeout);
        });

    });
});