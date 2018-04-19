import {RequisitionParser} from "./requisition-parser";


let validRequisition =
    {
        "requisitionVersion": "01.00.00",
        "timeout": 10000,
        "subscriptions": [
            {
                "type": "uds",
                "path": "/tmp/outUnix.sock",
                "onMessageReceived": "report['reportMessage'] = 'reportMessage'; test['true'] = true;",
                "timeout": 10000
            }
        ],
        "startEvent": {
            "publisher": {
                "type": "toBeDefined",
                "path": "/tmp/inUnix.sock",
                "payload": {

                    "requisitionVersion": "01.00.00",
                    "timeout": 3000,
                    "subscriptions": [
                        {
                            "type": "uds",
                            "path": "/tmp/loopUnix.sock",
                            "onMessageReceived": "test['works'] = message == 100;",
                            "timeout": 1000
                        }
                    ],
                    "startEvent": {
                        "publisher": {
                            "type": "uds",
                            "path": "/tmp/loopUnix.sock",
                            "payload": 100
                        }
                    }
                },

                "topic": "enqueuer/inception/beingTested/requisitionInput",
                "prePublishing": "publisher.type='uds';report['type'] = publisher.type;"
            }
        }
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

    it('Should accept valid stringified json', () => {
        const requisitionStringified: string = JSON.stringify(validRequisition);
        const parser: RequisitionParser = new RequisitionParser();

        const parsed = parser.parse(requisitionStringified);

        expect(parsed.startEvent.publisher.path).toBe("/tmp/inUnix.sock");
    });

});