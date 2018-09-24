import {PublisherReporter} from './publisher-reporter';
import {MultiPublishersReporter} from "./multi-publishers-reporter";
jest.mock('./publisher-reporter');

let publish = jest.fn();
let onFinishMock = jest.fn(() => {
    return 'onFinishMockStr';
});
let getReportMock = jest.fn(() => {
    return 'getReportMockStr';
});

const recreateMock = () => {
    PublisherReporter.mockImplementation(() => {
        return {
            publish: publish,
            onFinish: onFinishMock,
            getReport: getReportMock
        }
    })
};

let clearMock = function () {
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
        const publishers = [{name: 'first'}, {name: 'second'}];
        new MultiPublishersReporter(publishers);

        expect(PublisherReporter).toHaveBeenCalledTimes(publishers.length);
        expect(PublisherReporter).toHaveBeenCalledWith({name: 'first'});
        expect(PublisherReporter).toHaveBeenCalledWith({name: 'second'});
    });

    it('Should set default names', () => {
        const publishers = [{}, {}];
        new MultiPublishersReporter(publishers);

        expect(PublisherReporter).toHaveBeenCalledTimes(publishers.length);
        expect(PublisherReporter).toHaveBeenCalledWith({name: 'Publisher #0'});
        expect(PublisherReporter).toHaveBeenCalledWith({name: 'Publisher #1'});
    });

    it('Call publishReporter constructors empty publishers', () => {
        new MultiPublishersReporter();

        expect(PublisherReporter).toHaveBeenCalledTimes(0);
    });

    it('should handle fail success', done => {
        publish.mockImplementation(() => Promise.resolve());
        recreateMock();

        const publishers = [{}, {}];
        new MultiPublishersReporter(publishers)
            .publish()
            .then(() => {
                done();
            });

        expect(publish).toHaveBeenCalledTimes(publishers.length);
    });

    it('should handle fail publishing', done => {
        publish.mockImplementationOnce(() => Promise.resolve());
        publish.mockImplementationOnce(() => Promise.reject('err reason'));
        recreateMock();

        const publishers = [{}, {}];
        new MultiPublishersReporter(publishers)
            .publish()
            .catch((err) => {
                expect(err).toBe('err reason');
                done();
            });

        expect(publish).toHaveBeenCalledTimes(publishers.length);
    });

    it('should call onFinish', () => {
        const publishers = [{}, {}];

        new MultiPublishersReporter(publishers).onFinish();
        expect(onFinishMock).toHaveBeenCalledTimes(publishers.length);
    });

    it('should call getReport', () => {
        const publishers = [{}, {}];

        const report = new MultiPublishersReporter(publishers).getReport();
        expect(report.length).toBe(publishers.length);
        expect(getReportMock).toHaveBeenCalledTimes(publishers.length);
    });
});