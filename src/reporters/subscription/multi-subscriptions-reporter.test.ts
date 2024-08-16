import {SubscriptionReporter} from './subscription-reporter';
import {MultiSubscriptionsReporter} from './multi-subscriptions-reporter';

let startTimeoutMock = jest.fn(() => {});
let onFinishMock = jest.fn();
let hasFinishedMock = jest.fn();
// @ts-expect-error
let subscribeMock = jest.fn(() => new Promise());
// @ts-expect-error
let receiveMessageMock = jest.fn(() => new Promise());
let getReportMock: any;
let SubscriptionReporterMock = jest.fn(() => {
    return {
        startTimeout: startTimeoutMock,
        hasFinished: hasFinishedMock,
        subscribe: subscribeMock,
        onFinish: onFinishMock,
        receiveMessage: receiveMessageMock,
        getReport: getReportMock
    };
});

jest.mock('../subscription/subscription-reporter');
// @ts-expect-error
SubscriptionReporter.mockImplementation(SubscriptionReporterMock);

describe('MultiSubscriptionsReporter', () => {
    let constructorArgument: any;

    beforeEach(() => {
        constructorArgument = [
            {
                name: 'subName',
                type: 'subType'
            },
            {
                name: 'subName2',
                type: 'subType2'
            }
        ];
        startTimeoutMock = jest.fn(() => {});
        subscribeMock = jest.fn(() => new Promise(() => {}));
        receiveMessageMock = jest.fn(() => new Promise(() => {}));
    });

    afterEach(() => {
        // @ts-expect-error
        SubscriptionReporter.mockImplementation(SubscriptionReporterMock);
    });

    it('Should call subReporter constructor', () => {
        new MultiSubscriptionsReporter(constructorArgument);

        expect(SubscriptionReporterMock).toHaveBeenNthCalledWith(1, constructorArgument[0]);
        expect(SubscriptionReporterMock).toHaveBeenNthCalledWith(2, constructorArgument[1]);
    });

    it('Should call getReport of each', () => {
        getReportMock = jest.fn(() => {
            return {
                type: 'iei',
                valid: false,
                tests: [{valid: true}]
            };
        });
        const multi = new MultiSubscriptionsReporter(constructorArgument);

        const report = multi.getReport();

        expect(report).toEqual([
            {tests: [{valid: true}], type: 'iei', valid: false},
            {
                tests: [{valid: true}],
                type: 'iei',
                valid: false
            }
        ]);
        expect(getReportMock).toHaveBeenCalledTimes(2);
    });

    it('Should call onFinish of each', () => {
        onFinishMock = jest.fn();
        const multi = new MultiSubscriptionsReporter(constructorArgument);

        multi.onFinish();

        expect(onFinishMock).toHaveBeenCalledTimes(2);
    });

    it('Sub timeout before subscribed', async () => {
        // @ts-expect-error
        startTimeoutMock = jest.fn((cb: any) => setTimeout(cb, 2000));
        hasFinishedMock = jest.fn(() => true);

        const multi = new MultiSubscriptionsReporter(constructorArgument);

        multi.start();
        const subscriptionResult = await multi.subscribe();
        console.log(subscriptionResult);
    });

    it('Subtimeout before receiving message', async () => {
        receiveMessageMock = jest.fn(() => Promise.resolve());

        const subscriptions = [{}] as any;
        const multiSubscriptionsReporter = new MultiSubscriptionsReporter(subscriptions);
        await multiSubscriptionsReporter.receiveMessage();
        expect(receiveMessageMock).toHaveBeenCalledTimes(subscriptions.length);
    });

    it('Sub subscribed', (done) => {
        subscribeMock = jest.fn(() => Promise.resolve());
        let timeoutCb = jest.fn();

        const multi = new MultiSubscriptionsReporter(constructorArgument);

        multi.start();
        multi.subscribe().then(() => {
            expect(startTimeoutMock).toHaveBeenCalled();
            expect(timeoutCb).not.toHaveBeenCalled();
            done();
        });
    });

    it('Handling receiveMessage no subscription', (done) => {
        const multi = new MultiSubscriptionsReporter([]);

        multi.receiveMessage().then(() => {
            done();
        });
    });

    it('Handling receiveMessage success', (done) => {
        expect.assertions(0);
        receiveMessageMock = jest.fn(() => Promise.resolve());

        // @ts-expect-error
        new MultiSubscriptionsReporter([{}]).receiveMessage().then(() => {
            done();
        });
    });

    it('Should receiveMessage be success when there is no subscription', (done) => {
        expect.assertions(0);
        receiveMessageMock = jest.fn(() => Promise.resolve());

        new MultiSubscriptionsReporter([]).receiveMessage().then(() => {
            done();
        });
    });

    it('Handling happy path', (done) => {
        expect.assertions(0);
        subscribeMock = jest.fn(() => Promise.resolve());
        receiveMessageMock.mockImplementationOnce(() => Promise.resolve());
        // @ts-expect-error
        const multi = new MultiSubscriptionsReporter([{}]);
        // @ts-expect-error
        multi
            .subscribe(() => {})
            .then(() => {
                multi.receiveMessage().then(() => {
                    done();
                });
            });
    });
});
