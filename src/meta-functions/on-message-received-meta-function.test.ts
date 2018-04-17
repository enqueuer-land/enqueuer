import {OnMessageReceivedMetaFunction} from "./on-message-received-meta-function";
import {SubscriptionModel} from "../requisitions/models/subscription-model";

describe('OnMessageReceivedMetaFunction', () => {

    it('should insert tests', function () {
        const constructorArgument: SubscriptionModel = {
            type: "test",
            onMessageReceived: "test[\"valid\"] = true;"
        };
        const onMessage: OnMessageReceivedMetaFunction = new OnMessageReceivedMetaFunction(constructorArgument);

        const functionResponse: any = new Function(onMessage.createBody())();

        expect(functionResponse.test.valid).toBeTruthy();
    });

    it('should insert reports', function () {
        const constructorArgument: SubscriptionModel = {
            type: "test",
            onMessageReceived: "report[\"first\"] = \"someValue\";"
        };
        const onMessage: OnMessageReceivedMetaFunction = new OnMessageReceivedMetaFunction(constructorArgument);

        const functionResponse: any = new Function(onMessage.createBody())();

        expect(functionResponse.report.first).toBe("someValue");
    });

});

