import {PrePublishMetaFunction} from "./pre-publish-meta-function";
import {PublisherModel} from "../requisitions/models/publisher-model";

describe('PrePublishMetaFunction', () => {

    it('should pass constructor argument as object in function', function () {
        const constructorArgument: PublisherModel = {
            type: 'test'
        };
        const prePublishMeta: PrePublishMetaFunction = new PrePublishMetaFunction(constructorArgument);

        const functionResponse: any = prePublishMeta.createFunction()();

        expect(JSON.stringify(functionResponse.publisher)).toBe(JSON.stringify(constructorArgument));
    });

    it('should insert tests', function () {
        const constructorArgument: PublisherModel = {
            type: "test",
            prePublishing: "test['valid'] = true;"
        };
        const prePublishMeta: PrePublishMetaFunction = new PrePublishMetaFunction(constructorArgument);

        const functionResponse: any = prePublishMeta.createFunction()();

        expect(functionResponse.test.valid).toBeTruthy();
    });

    it('should insert reports', function () {
        const constructorArgument: PublisherModel = {
            type: "test",
            prePublishing: "report['first'] = 'someValue';"
        };
        const prePublishMeta: PrePublishMetaFunction = new PrePublishMetaFunction(constructorArgument);

        const functionResponse: any = prePublishMeta.createFunction()();

        expect(functionResponse.report.first).toBe("someValue");
    });

    it('should receive args', function () {
        const constructorArgument: PublisherModel = {
            type: "test",
            prePublishing: "report['args'] = args;"
        };
        const expected = "Yayayaya";
        const prePublishMeta: PrePublishMetaFunction = new PrePublishMetaFunction(constructorArgument);

        const functionResponse: any = prePublishMeta.createFunction()(expected);

        expect(functionResponse.report.args).toBe(expected);
    });

    it('should throw exception bad function', function () {
        const constructorArgument: PublisherModel = {
            type: "test",
            prePublishing: "'args'] = args;"
        };
        const prePublishMeta: PrePublishMetaFunction = new PrePublishMetaFunction(constructorArgument);

        expect(() => prePublishMeta.createFunction()).toThrow();
    });

});

