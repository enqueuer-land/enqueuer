import {PublisherReporter} from './publisher-reporter';
import {MultiPublishersReporter} from './multi-publishers-reporter';

jest.mock('./publisher-reporter');

let publish = jest.fn();
let onFinishMock = jest.fn(() => {
    return 'onFinishMockStr';
});
let getReportMock = jest.fn(() => {
    return 'getReportMockStr';
});

const recreateMock = () => {
    // @ts-expect-error
    PublisherReporter.mockImplementation(() => {
        return {
            publish: publish,
            onFinish: onFinishMock,
            getReport: getReportMock
        };
    });
};

let clearMock = function () {
    // @ts-expect-error
    PublisherReporter.mockClear();
    publish.mockClear();
    onFinishMock.mockClear();
    getReportMock.mockReset();
};

describe('MultiPublishersReporter', () => {
    beforeEach(() => {
        recreateMock();
    });

    afterEach(() => {
        clearMock();
    });

    it('Call publishReporter constructors', () => {
        const publishers = [{name: 'first'}, {name: 'second'}] as any;
        new MultiPublishersReporter(publishers);

        expect(PublisherReporter).toHaveBeenCalledTimes(publishers.length);
        expect(PublisherReporter).toHaveBeenCalledWith({name: 'first'});
        expect(PublisherReporter).toHaveBeenCalledWith({name: 'second'});
    });

    it('Call publishReporter constructors empty publishers', () => {
        new MultiPublishersReporter([]);

        expect(PublisherReporter).toHaveBeenCalledTimes(0);
    });

    it('should handle success', done => {
        publish.mockImplementation(() => Promise.resolve());
        recreateMock();

        const publishers = [{}, {}] as any;
        new MultiPublishersReporter(publishers)
            .publish()
            .then(() => {
                done();
            });

        expect(publish).toHaveBeenCalledTimes(publishers.length);
    });

    it('should handle be success when no publisher is given', done => {
        new MultiPublishersReporter([])
            .publish()
            .then(() => {
                done();
            });

        expect(publish).toHaveBeenCalledTimes(0);
    });

    it('should handle fail publishing', async () => {
        publish.mockImplementationOnce(() => Promise.resolve());
        publish.mockImplementationOnce(() => Promise.reject('err reason'));
        recreateMock();

        const publishers = [{}, {}] as any;
        await new MultiPublishersReporter(publishers).publish();
        expect(publish).toHaveBeenCalledTimes(publishers.length);
    });

    it('should call onFinish', () => {
        const publishers = [{}, {}] as any;

        new MultiPublishersReporter(publishers).onFinish();
        expect(onFinishMock).toHaveBeenCalledTimes(publishers.length);
    });

    it('should call getReport', () => {
        const publishers = [{}, {}] as any;

        const report = new MultiPublishersReporter(publishers).getReport();
        expect(report.length).toBe(publishers.length);
        expect(getReportMock).toHaveBeenCalledTimes(publishers.length);
    });
});
