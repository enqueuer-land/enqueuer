import {RunnableParser} from "./runnable-parser";

let validRunnable =
    {
        "collectionVersion": "01.00.00",
        "runnables": [
            {
                "timeout": 3000,
                "subscriptions": [
                    {
                        "type": "uds",
                        "path": "/tmp/unix.sock",
                        "timeout": 500
                    }
                ],
                "startEvent": {
                    "publisher": {
                        "type": "uds",
                        "path": "/tmp/unix.sock",
                        "payload": "{{sessionKey}}"
                    }
                }
            },
            {
                "collectionVersion": "01.00.00",
                "initialDelay": 3000,
                iterations: 2,
                runnables: []
            }
        ]
    };

describe('RunnableParser', () => {

    it('Should not parse invalid json', () => {
        const runnable = "invalidJson";
        const parser: RunnableParser = new RunnableParser();

        expect(() => parser.parse(runnable)).toThrow()
    });

    it('Should not parse invalid requisition', () => {
        const runnable = "{\"invalid\": \"runnable\"}";
        const parser: RunnableParser = new RunnableParser();

        expect(() => parser.parse(runnable)).toThrow()
    });

    it('Should accept valid stringified json', () => {
        const runnableStringified: string = JSON.stringify(validRunnable);
        const parser: RunnableParser = new RunnableParser();

        expect(parser.parse(runnableStringified)).not.toBeNull();
    });

});