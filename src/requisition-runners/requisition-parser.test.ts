import {RequisitionParser} from "./requisition-parser";

const valid = [
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
        publishers: [{
            name: "name",
            type: "uds",
            path: "/tmp/unix.sock",
            payload: "{{sessionKey}}"
        }]
    },
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
        publishers: [{
            name: "name",
            type: "uds",
            path: "/tmp/unix.sock",
            payload: "{{sessionKey}}"
        },{
            name: "name",
            type: "uds",
            path: "/tmp/unix.sock",
            payload: "{{sessionKey}}"
        }]
    }
];
const validWithId = [{
    timeout: 3000,
    name: "name",
    id: "nameId",
    subscriptions: [
        {
            name: "name",
            type: "uds",
            path: "/tmp/unix.sock",
            timeout: 500
        }
    ],
    publishers: [{
        name: "name",
        type: "uds",
        path: "/tmp/unix.sock",
        payload: "{{sessionKey}}"
    }],
    requisitions: [{
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
    publishers: [{
        name: "name",
        type: "uds",
        path: "/tmp/unix.sock",
        payload: "{{sessionKey}}"
    }],
        requisitions: [
            {
                timeout: 3000,
                delay: 3000,
                name: "name",
                subscriptions: [
                    {
                        name: "name",
                        type: "uds",
                        path: "/tmp/unix.sock",
                        timeout: 500
                    }
                ],
                publishers: [{
                    name: "name",
                    type: "uds",
                    path: "/tmp/unix.sock",
                    payload: "{{sessionKey}}"
                }],
                requisitions: []

            }
        ]
    }]
}];
const validRunnable = {
        "timeout": 3000,
        "name": "file",
        "iterations": "10",
        "subscriptions": [],
        "publishers": [{
            "type": "file",
            "name": "filePublisher",
            "payload": "filePublisher",
            "filenamePrefix": "temp/fileTest",
            "filenameExtension": "file",
            "onInit": "publisher.payload=new Date().getTime();"
        }],
        requisitions: []
    };

describe('RequisitionParser', () => {

    it('Should not parse invalid json', () => {
        const runnable = "[00inv;alid";
        const parser: RequisitionParser = new RequisitionParser();

        expect(() => parser.parse(runnable)).toThrow()
    });

    it('Should not parse empty requisition', () => {
        const parser: RequisitionParser = new RequisitionParser();

        expect(() => parser.parse()).toThrow()
    });

    it('Should keep initial id', () => {
        const runnableStringified: string = JSON.stringify(validWithId);
        const parser: RequisitionParser = new RequisitionParser();

        const firstModel = parser.parse(runnableStringified)[0];
        expect(firstModel.id).toBe(validWithId[0].id);
    });

    // it('Should insert id if no one is given', () => {
    //     const runnableStringified: string = JSON.stringify(valid);
    //     const parser: RequisitionParser = new RequisitionParser();
    //
    //     expect(parser.parse(runnableStringified)[0].id).toBeDefined();
    // });

    it('Should accept valid stringified json', () => {
        const runnableStringified: string = JSON.stringify(validRunnable);
        const parser: RequisitionParser = new RequisitionParser();

        expect(parser.parse(runnableStringified)).toBeDefined();
    });

    it('Should accept runnable with no subscriptions', () => {
        expect(new RequisitionParser().parse(JSON.stringify(validRunnable))).not.toBeNull();
    });

});
