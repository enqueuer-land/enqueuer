import {ReportValidFieldsFilter} from "./report-valid-fields-filter";
import {Report} from "./report";

const unfilteredReport: Report = Report.create("name",{
    "valid": true,
    "runnableAmqp": {
        "valid": true,
        "tests": [
            {
                "name": "No timeout",
                "valid": true
            }
        ],
        "AmqpPub": {
            "valid": true,
            "prePublishingFunctionReport": {
                "publisher": {
                    "type": "amqp",
                    "name": "AmqpPub",
                    "payload": "1524694233639",
                    "options": {
                        "host": "localhost",
                        "port": 5672
                    },
                    "queueName": "enqueuerQueue",
                    "prePublishing": "publisher.payload=new Date().getTime();"
                },
                "tests": [],
                "report": {}
            },
            "timestamp": "2018-04-25T22:10:33.647Z",
            "type": "amqp"
        },
        "subscriptions": {
            "valid": true,
            "AmqpSubs": {
                "valid": true,
                "tests": [
                    {
                        "name": "works",
                        "valid": true
                    },
                    {
                        "name": "Message received",
                        "valid": true
                    },
                    {
                        "name": "No timeout",
                        "valid": true
                    }
                ],
                "connectionTime": "2018-04-25T22:10:33.638Z",
                "onMessageFunctionReport": {
                    "tests": [
                        {
                            "name": "works",
                            "valid": true
                        }
                    ],
                    "report": {
                        "virgs": "lopídio"
                    }
                },
                "messageReceivedTimestamp": "2018-04-25T22:10:33.647Z",
                "type": "amqp",
                "hasReceivedMessage": true,
                "hasTimedOut": false
            }
        },
        "time": {
            "totalTime": 20,
            "startTime": "2018-04-25T22:10:33.628Z",
            "endTime": "2018-04-25T22:10:33.648Z",
            "timeout": 3000,
            "hasTimedOut": false
        }
    },
    "runnableFile": {
        "valid": true,
        "tests": [
            {
                "name": "No timeout",
                "valid": true
            }
        ],
        "filePublisher": {
            "valid": true,
            "prePublishingFunctionReport": {
                "publisher": {
                    "type": "file",
                    "name": "filePublisher",
                    "payload": "1524694233762",
                    "filenamePrefix": "temp/fileTest",
                    "filenameExtension": "file",
                    "prePublishing": "publisher.payload=new Date().getTime();"
                },
                "tests": [],
                "report": {}
            },
            "timestamp": "2018-04-25T22:10:33.867Z",
            "type": "file"
        },
        "subscriptions": {
            "valid": true,
            "fileSubscription": {
                "valid": true,
                "tests": [
                    {
                        "name": "some time has passed",
                        "valid": true
                    },
                    {
                        "name": "Message received",
                        "valid": true
                    },
                    {
                        "name": "No timeout",
                        "valid": true
                    }
                ],
                "connectionTime": "2018-04-25T22:10:33.762Z",
                "onMessageFunctionReport": {
                    "tests": [
                        {
                            "name": "some time has passed",
                            "valid": true
                        }
                    ],
                    "report": {
                        "something": 1524694233867
                    }
                },
                "messageReceivedTimestamp": "2018-04-25T22:10:33.867Z",
                "type": "file-name-watcher",
                "hasReceivedMessage": true,
                "hasTimedOut": false
            }
        },
        "time": {
            "totalTime": 112,
            "startTime": "2018-04-25T22:10:33.756Z",
            "endTime": "2018-04-25T22:10:33.868Z",
            "timeout": 3000,
            "hasTimedOut": false
        }
    }
})

describe('ReportValidFieldsFilter', () => {
    it('Should filter only stuff that matters', () => {

        const expectedFilteredReport = {
            "runnableAmqp": {
                "subscriptions": {
                    "AmqpSubs": {
                        "tests": [{"works": true}, {"Message received": true}, {"No timeout": true}],
                        "valid": true
                    }, "valid": true
                }, "tests": [{"No timeout": true}], "valid": true
            },
            "runnableFile": {
                "subscriptions": {
                    "fileSubscription": {
                        "tests": [{"some time has passed": true}, {"Message received": true}, {"No timeout": true}],
                        "valid": true
                    }, "valid": true
                }, "tests": [{"No timeout": true}], "valid": true
            },
            "valid": true
        };

        const filter: ReportValidFieldsFilter = new ReportValidFieldsFilter();
        expect(filter.filterReport(unfilteredReport)).toEqual(expectedFilteredReport);
    });
});