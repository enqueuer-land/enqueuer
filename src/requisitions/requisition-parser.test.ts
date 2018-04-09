import {RequisitionParser} from "./requisition-parser";


let validRequisition = function () {
    return {
        "requisitionVersion": "01.00.00",
        "timeout": 2000,
        "subscriptions": [],
        "startEvent": {
            "subscription":
                {
                    "type": "mqtt",
                    "brokerAddress": "brokerAddress",
                    "topic": "anotherSubscriptionTopic",
                    "onMessageReceived": "test['someLabel'] = false",
                    "timeout": 1000
                }
        }
    };
};
describe('RequisitionParser', () => {

    it('Should not parse invalid json', () => {
        const requisition = "invalidJson";
        const parser: RequisitionParser = new RequisitionParser();

        expect(() => parser.parse(requisition)).toThrow()
    });

    it('Should not parse invalid requisition', () => {
        const requisition = "{\"invalid\": \"requisition\"}";
        const parser: RequisitionParser = new RequisitionParser();

        expect(() => parser.parse(requisition)).toThrow()
    });

    it('Should accept valid json', () => {
        const requisition = validRequisition();
        const requisitionStringified: string = JSON.stringify(requisition);
        const parser: RequisitionParser = new RequisitionParser();

        const parsed = parser.parse(requisitionStringified);

        expect(parsed.startEvent.subscription.brokerAddress).toBe("brokerAddress");
    });

});