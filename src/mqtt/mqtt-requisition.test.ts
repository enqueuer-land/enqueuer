import { MqttRequisitionFileParser } from './mqtt-requisition-file-parser';
import { expect } from 'chai';
import 'mocha';

describe('MqttRequisitionFile test', function() {
    describe('Constructor', function() {
        const mqttRequisitionFileParser = new MqttRequisitionFileParser();
        const filename = "resources/test/conf-test.json";

        it('should raise exception if file does not exist', function() {
            const nonExistentFile = "nonExistentFile";

            expect(() => mqttRequisitionFileParser.parse(nonExistentFile)).to.throw();
        });

        it('should parse all subscriptionTopicsList', function() {
            const expectedTopics = ["1", "2/#"];
            const mqttRequisitionFile = mqttRequisitionFileParser.parse(filename);

            const actualTopics = mqttRequisitionFile.subscribe;
            
            for (let index: number = 0; index < actualTopics.length; ++index) {
                expect(actualTopics[index]).to.be.equal(expectedTopics[index]);
            }
            expect(actualTopics.length).to.be.equal(expectedTopics.length);
        });

        it('should parse topicToPublish', function() {
            const mqttRequisitionFile = mqttRequisitionFileParser.parse(filename);

            const actualTopic = mqttRequisitionFile.publish.topic;
            const expectedTopic = "topicToPublish";
            expect(actualTopic).to.be.equal(expectedTopic);
        });

    });
});