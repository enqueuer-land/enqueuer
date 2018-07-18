import {OnMessageReceivedMetaFunctionBody} from "./on-message-received-meta-function-body";
import {SubscriptionModel} from "../models/inputs/subscription-model";

describe('OnMessageReceivedMetaFunctionBody', () => {

    it('should insert tests', function () {
        const constructorArgument: SubscriptionModel = {
            type: "test",
            onMessageReceived: "test[\"valid\"] = true;"
        };
        const onMessage: OnMessageReceivedMetaFunctionBody = new OnMessageReceivedMetaFunctionBody(constructorArgument.onMessageReceived, "");

        const functionResponse: any = new Function(onMessage.createBody())();

        expect(functionResponse.test.valid).toBeTruthy();
    });

    it('should insert reports', function () {
        const constructorArgument: SubscriptionModel = {
            type: "test",
            onMessageReceived: "report[\"first\"] = \"someValue\";"
        };
        const onMessage: OnMessageReceivedMetaFunctionBody = new OnMessageReceivedMetaFunctionBody(constructorArgument.onMessageReceived, "");

        const functionResponse: any = new Function(onMessage.createBody())();

        expect(functionResponse.report.first).toBe("someValue");
    });

});

