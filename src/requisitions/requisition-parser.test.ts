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
        },
        "reports": [],
        "variables": {
            "brokerAddress": "mqtt://localhost"
        }
    };
};
describe('RequisitionParser', () => {

    it('Should not parse invalid json', () => {
        const requisition = "invalidJson";
        const parser: RequisitionParser = new RequisitionParser();

        return expect(parser.parse(requisition)).rejects.toBe("SyntaxError: Unexpected token i in JSON at position 0");
    });

    it('Should not parse invalid requisition', () => {
        const requisition = "{\"invalid\": \"requisition\"}";
        const parser: RequisitionParser = new RequisitionParser();

        return expect(parser.parse(requisition)).rejects.toEqual([{
            "dataPath": "",
            "keyword": "additionalProperties",
            "message": "should NOT have additional properties",
            "params": {"additionalProperty": "invalid"},
            "schemaPath": "#/additionalProperties"
        }]);
    });

    it('Should replace variables', () => {

        const requisition = validRequisition();
        const requisitionStringified: string = JSON.stringify(requisition);
        const parser: RequisitionParser = new RequisitionParser();

        return parser.parse(requisitionStringified).then( parsed => {
            expect(parsed.variables).toBeUndefined();
            expect(parsed.startEvent.subscription.brokerAddress).toBe("mqtt://localhost");
        });
    });

});