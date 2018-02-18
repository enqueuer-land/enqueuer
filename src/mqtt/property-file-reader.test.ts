import { PropertyFileReader } from './property-file-reader';
import { expect } from 'chai';
import 'mocha';

describe('PropertyFileReader test', function() {
    describe('Constructor', function() {
        it('should raise exception if file does not exist', function() {
            const nonExistentFile = "nonExistentFile";
            expect(() => new PropertyFileReader(nonExistentFile)).to.throw(Error, "File not found: " + nonExistentFile);
        });

        it('should parse all subscriptionTopicsList', function() {
            const filename = "resources/test/subscriptionTopicsListTest.json";
            const propertyFileReader = new PropertyFileReader(filename);

            const actualTopics = propertyFileReader.getSubscriptionTopics();
            const expectedTopics = ["1", "2/#"];
            console.log(actualTopics)
            for (let index: number = 0; index < actualTopics.length; ++index) {
                expect(actualTopics[index]).to.be.equal(expectedTopics[index]);
            }
            expect(actualTopics.length).to.be.equal(expectedTopics.length);
        });
    });
});