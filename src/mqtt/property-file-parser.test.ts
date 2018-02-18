import { PropertyFileParser } from './property-file-parser';
import { expect } from 'chai';
import 'mocha';

describe('PropertyFileParser test', function() {
    describe('Constructor', function() {
        const propertyFileParser = new PropertyFileParser();
        const filename = "resources/test/conf-test.json";

        it('should raise exception if file does not exist', function() {
            const nonExistentFile = "nonExistentFile";

            expect(() => propertyFileParser.parse(nonExistentFile)).to.throw();
        });

        it('should parse all subscriptionTopicsList', function() {
            const expectedTopics = ["1", "2/#"];
            const propertyFile = propertyFileParser.parse(filename);

            const actualTopics = propertyFile.subscribe;
            
            for (let index: number = 0; index < actualTopics.length; ++index) {
                expect(actualTopics[index]).to.be.equal(expectedTopics[index]);
            }
            expect(actualTopics.length).to.be.equal(expectedTopics.length);
        });

        it('should parse topicToPublish', function() {
            const propertyFile = propertyFileParser.parse(filename);

            const actualTopic = propertyFile.publish.topic;
            const expectedTopic = "topicToPublish";
            expect(actualTopic).to.be.equal(expectedTopic);
        });

    });
});