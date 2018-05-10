import {PrePublishMetaFunctionBody} from "./pre-publish-meta-function-body";
import {PublisherModel} from "../models/publisher-model";

describe('PrePublishMetaFunctionBody', () => {

    it('should pass constructor argument as object in function', function () {
        const constructorArgument: PublisherModel = {
            type: 'test'
        };
        const prePublishMeta: PrePublishMetaFunctionBody = new PrePublishMetaFunctionBody(constructorArgument);

        const functionResponse: any = new Function(prePublishMeta.createBody())();

        expect(JSON.stringify(functionResponse.publisher)).toBe(JSON.stringify(constructorArgument));
    });

    it('should insert tests', function () {
        const constructorArgument: PublisherModel = {
            type: "test",
            prePublishing: "test['valid'] = true;"
        };
        const prePublishMeta: PrePublishMetaFunctionBody = new PrePublishMetaFunctionBody(constructorArgument);

        const functionResponse: any = new Function(prePublishMeta.createBody())();

        expect(functionResponse.test.valid).toBeTruthy();
    });

    it('should insert reports', function () {
        const constructorArgument: PublisherModel = {
            type: "test",
            prePublishing: "report['first'] = 'someValue';"
        };
        const prePublishMeta: PrePublishMetaFunctionBody = new PrePublishMetaFunctionBody(constructorArgument);

        const functionResponse: any = new Function(prePublishMeta.createBody())();

        expect(functionResponse.report.first).toBe("someValue");
    });

    it('should throw exception bad function', function () {
        const constructorArgument: PublisherModel = {
            type: "test",
            prePublishing: "'args'] = args;"
        };
        const prePublishMeta: PrePublishMetaFunctionBody = new PrePublishMetaFunctionBody(constructorArgument);

        expect(() => new Function(prePublishMeta.createBody())()).toThrow();
    });

});

