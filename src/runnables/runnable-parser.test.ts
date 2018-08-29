import {RunnableParser} from "./runnable-parser";

const validRunnable = {
    sion: "01.00.00",
    name: "name",
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
            sion: "01.00.00",
            name: "name",
            runnables: [
                {
                    sion: "01.00.00",
                    name: "name",
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
                            sion: "01.00.00",
                            name: "name",
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
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
const validRunnableWithId = {
    "name": "runnableFile",
    "id": "virgulation",
    "runnables": [
        {
            "timeout": 3000,
            "name": "file",
            "subscriptions": [
                {
                    "type": "file-name-watcher",
                    "name": "fileSubscription",
                    "fileNamePattern": "temp/fileTest*file",
                    "onMessageReceived": "const now = new Date().getTime(); test['some time has passed'] = now + '' >= message; report['something'] = now;",
                    "timeout": 1000
                }
            ],
            "startEvent": {
                "publisher": {
                    "type": "file",
                    "name": "filePublisher",
                    "payload": "filePublisher",
                    "filenamePrefix": "temp/fileTest",
                    "filenameExtension": "file",
                    "onInit": "publisher.payload=new Date().getTime();"
                }
            }
        }
    ]
};
const validRunnableWithNoSubscriptions = {
    "name": "runnableFile",
    "id": "virgulation",
    "runnables": [
        {
            "timeout": 3000,
            "name": "file",
            "subscriptions": [],
            "startEvent": {
                "publisher": {
                    "type": "file",
                    "name": "filePublisher",
                    "payload": "filePublisher",
                    "filenamePrefix": "temp/fileTest",
                    "filenameExtension": "file",
                    "onInit": "publisher.payload=new Date().getTime();"
                }
            }
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

    it('Should keep initial id', () => {
        const runnableStringified: string = JSON.stringify(validRunnableWithId);
        const parser: RunnableParser = new RunnableParser();

        expect(parser.parse(runnableStringified).id).toBe(validRunnableWithId.id);
    });

    it('Should insert id if no one is given', () => {
        const runnableStringified: string = JSON.stringify(validRunnable);
        const parser: RunnableParser = new RunnableParser();

        expect(parser.parse(runnableStringified).id).toBeDefined();
    });

    it('Should accept valid stringified json', () => {
        const runnableStringified: string = JSON.stringify(validRunnable);
        const parser: RunnableParser = new RunnableParser();

        expect(parser.parse(runnableStringified)).not.toBeNull();
    });

    it('Should accept runnable with no subscriptions', () => {
        expect(new RunnableParser().parse(JSON.stringify(validRunnableWithNoSubscriptions))).not.toBeNull();
    });

});