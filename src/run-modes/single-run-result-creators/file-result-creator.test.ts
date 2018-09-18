import {FileResultCreator} from "./file-result-creator";
import {FilePublisher} from '../../publishers/file-publisher';

jest.mock("../../publishers/file-publisher");
const filePublisherSyncMock = jest.fn(() => {
    return {
        publish: () => Promise.resolve()
    };
});
FilePublisher.mockImplementation(filePublisherSyncMock);

describe('FileResultCreator', () => {

    it('Should instantiate FilePublisher', () => {
        const filename = 'filename';
        const creator = new FileResultCreator(filename);
        creator.create();

        const expected = {"filename": "filename", "name": "filename", "pretty": true, "type": "file"};

        expect(filePublisherSyncMock).toHaveBeenCalledWith(expected);
    });

    it('Should be true by default', () => {
        const filename = 'filename.yaml';
        const creator = new FileResultCreator(filename);
        expect(creator.isValid()).toBeTruthy();
    });


});

