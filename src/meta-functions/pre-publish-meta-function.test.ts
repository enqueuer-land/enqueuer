import {PrePublishMetaFunction} from "./pre-publish-meta-function";
import {PublisherModel} from "../requisitions/models/publisher-model";

describe('PrePublishMetaFunction', () => {

    it('should pass constructor argument as object in function', function () {
        const constructorArgument: PublisherModel = {
            type: 'test'
        };
        const prePublishMeta: PrePublishMetaFunction = new PrePublishMetaFunction(constructorArgument);

        const functionResponse: any = new Function(prePublishMeta.createBody())();

        expect(JSON.stringify(functionResponse.publisher)).toBe(JSON.stringify(constructorArgument));
    });

    it('should insert tests', function () {
        const constructorArgument: PublisherModel = {
            type: "test",
            prePublishing: "test['valid'] = true;"
        };
        const prePublishMeta: PrePublishMetaFunction = new PrePublishMetaFunction(constructorArgument);

        const functionResponse: any = new Function(prePublishMeta.createBody())();

        expect(functionResponse.test.valid).toBeTruthy();
    });

    it('should insert reports', function () {
        const constructorArgument: PublisherModel = {
            type: "test",
            prePublishing: "report['first'] = 'someValue';"
        };
        const prePublishMeta: PrePublishMetaFunction = new PrePublishMetaFunction(constructorArgument);

        const functionResponse: any = new Function(prePublishMeta.createBody())();

        expect(functionResponse.report.first).toBe("someValue");
    });

    it('should throw exception bad function', function () {
        const constructorArgument: PublisherModel = {
            type: "test",
            prePublishing: "'args'] = args;"
        };
        const prePublishMeta: PrePublishMetaFunction = new PrePublishMetaFunction(constructorArgument);

        expect(() => new Function(prePublishMeta.createBody())()).toThrow();
    });

});

