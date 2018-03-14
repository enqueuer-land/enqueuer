import {OnMessageReceivedMetaFunction} from "./on-message-received-meta-function";
import {SubscriptionModel} from "../requisitions/model/subscription-model";

describe('OnMessageReceivedMetaFunction', () => {

    // console.log(JSON.stringify(functionResponse, null, 8));
    it('should pass constructor argument as object in function', function () {
        const constructorArgument: SubscriptionModel = {
            type: "test",
            messageReceived: "somePayload",
            onMessageReceived: "let c = 0;"
        };
        const onMessage: OnMessageReceivedMetaFunction = new OnMessageReceivedMetaFunction(constructorArgument);

        const functionResponse: any = onMessage.createFunction();

        const functionResponseBody = functionResponse.toString();
        expect(functionResponseBody).toMatch(JSON.stringify(constructorArgument.messageReceived))
        expect(functionResponse.toString()).toEqual(expect.stringContaining(constructorArgument.onMessageReceived));
    });

    it('should insert tests', function () {
        const constructorArgument: SubscriptionModel = {
            type: "test",
            onMessageReceived: "test[\"valid\"] = true;"
        };
        const onMessage: OnMessageReceivedMetaFunction = new OnMessageReceivedMetaFunction(constructorArgument);

        const functionResponse: any = onMessage.createFunction()();

        expect(functionResponse.test.valid).toBeTruthy();
    });

    it('should insert reports', function () {
        const constructorArgument: SubscriptionModel = {
            type: "test",
            onMessageReceived: "report[\"first\"] = \"someValue\";"
        };
        const onMessage: OnMessageReceivedMetaFunction = new OnMessageReceivedMetaFunction(constructorArgument);

        const functionResponse: any = onMessage.createFunction()();

        expect(functionResponse.report.first).toBe("someValue");
    });

    it('should insert receive args', function () {
        const constructorArgument: SubscriptionModel = {
            type: "test",
            onMessageReceived: "report[\"args\"] = args;"
        };
        const args = "value";
        const onMessage: OnMessageReceivedMetaFunction = new OnMessageReceivedMetaFunction(constructorArgument);

        const functionResponse: any = onMessage.createFunction()(args);

        expect(functionResponse.report.args).toBe("value");
    });

});

