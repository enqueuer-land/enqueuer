import {RunnableParser} from "./runnable-parser";

const validRunnable =
    {
        runnableVersion: "01.00.00",
        name: "name",
        initialDelay: 10,
        runnables: [
            {
                timeout: 3000,
                name: "name",
                subscriptions: [
                    {
                        name: "name",
                        type: "uds",
                        path: "/tmp/unix.sock",
                        timeout: 500
                    }
                ],
                startEvent: {
                    publisher: {
                        name: "name",
                        type: "uds",
                        path: "/tmp/unix.sock",
                        payload: "{{sessionKey}}"
                    }
                }
            },
            {
                runnableVersion: "01.00.00",
                name: "name",
                initialDelay: 3000,
                runnables: [
                    {
                        runnableVersion: "01.00.00",
                        name: "name",
                        initialDelay: 10,
                        runnables: [
                            {
                                timeout: 3000,
                                name: "name",
                                subscriptions: [
                                    {
                                        name: "name",
                                        type: "uds",
                                        path: "/tmp/unix.sock",
                                        timeout: 500
                                    }
                                ],
                                startEvent: {
                                    publisher: {
                                        name: "name",
                                        type: "uds",
                                        path: "/tmp/unix.sock",
                                        payload: "{{sessionKey}}"
                                    }
                                }
                            },
                            {
                                runnableVersion: "01.00.00",
                                name: "name",
                                initialDelay: 3000,
                                runnables: []
                            }
                        ]
                    }
                ]
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