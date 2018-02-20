import { MqttRequisitionParser } from './mqtt-requisition-parser';
import { expect } from 'chai';
import 'mocha';
import { Subscription, MqttRequisition } from './model/mqtt-requisition';
const fs = require("fs");

describe('mqttRequisitionParser test', function() {
    describe('Constructor', function() {
        const mqttRequisitionParser = new MqttRequisitionParser();
        const filename = "resources/test/mqtt-requisition-test.json";
        const filenameNoPublish: string = "resources/test/mqtt-requisition-no-publish-test.json";
        const fileContent = fs.readFileSync(filename);
        const fileContentNoPublish = fs.readFileSync(filenameNoPublish);

        it('should raise exception if parse fails', function() {
            const invalidRequisition = "invalidRequisition";

            expect(() => mqttRequisitionParser.parse(invalidRequisition)).to.throw();
        });

        it('should parse all subscriptions', function() {
            const mqttRequisition = mqttRequisitionParser.parse(fileContent);
            
            const expectedSubscriptions = [
                {
                    timeout: 2000,
                    topic: "1",
                    onMessageReceived: "console.log(\"body:\" + JSON.stringify(response)); test['value'] = false;"                    
                },
                {
                    timeout: null,
                    onMessageReceived: null, 
                    topic: "2/#"
                }];

            const actualSubscriptions = mqttRequisition.subscriptions;
            for (let index: number = 0; index < actualSubscriptions.length; ++index) {
                expect(actualSubscriptions[index]).to.be.deep.equal(expectedSubscriptions[index]);
            }
            expect(actualSubscriptions.length).to.be.equal(expectedSubscriptions.length);
        });

        it('should parse topicToPublish', function() {
            const mqttRequisition = mqttRequisitionParser.parse(fileContent);

            const actualTopic = mqttRequisition.publish.topic;
            const expectedTopic = "topicToPublish";
            expect(actualTopic).to.be.equal(expectedTopic);
        });

        it('should parse topicToPublish even if its null', function() {
            const mqttRequisition = mqttRequisitionParser.parse(fileContentNoPublish);

            expect(mqttRequisition.publish).to.be.null;
        });

        it('should parse brokerAddress', function() {
            const mqttRequisition = mqttRequisitionParser.parse(fileContent);

            const actualBrokerAddress = mqttRequisition.brokerAddress;
            const expectedBrokerAddress = "brokerAddress";
            expect(actualBrokerAddress).to.be.equal(expectedBrokerAddress);
        });

        it('should parse protocol', function() {
            const mqttRequisition = mqttRequisitionParser.parse(fileContent);

            const actualProtocol = mqttRequisition.protocol;
            const expectedProtocol = "mqtt";
            expect(actualProtocol).to.be.equal(expectedProtocol);
        });

    });
});