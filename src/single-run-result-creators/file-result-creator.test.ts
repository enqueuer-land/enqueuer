import {FileResultCreator} from "./file-result-creator";
import * as fs from 'fs';

jest.mock("fs");
const writeFileSyncMock = jest.fn();
fs.writeFileSync.mockImplementation(writeFileSyncMock);

describe('FileResultCreator', () => {

    it('Should stringify as JSON by default', () => {
        const filename = 'filename';
        const creator = new FileResultCreator(filename);
        creator.create();

        const expected = {
            name: filename,
            tests: [],
            valid: true,
            requisitions: []
        };

        expect(writeFileSyncMock).toHaveBeenCalledWith(filename, JSON.stringify(expected, null, 2));
    });

    it('Should stringify to yaml when ends with yml', () => {
        const filename = 'filename.yml';
        const creator = new FileResultCreator(filename);
        creator.create();

        expect(writeFileSyncMock).toHaveBeenCalledWith(filename, 'name: filename.yml\n' +
            'tests: []\n' +
            'valid: true\n' +
            'requisitions: []\n');
    });

    it('Should stringify to yaml when ends with yaml', () => {
        const filename = 'filename.yaml';
        const creator = new FileResultCreator(filename);
        creator.create();

        expect(writeFileSyncMock).toHaveBeenCalledWith(filename, 'name: filename.yaml\n' +
            'tests: []\n' +
            'valid: true\n' +
            'requisitions: []\n');
    });

    it('Should be true by default', () => {
        const filename = 'filename.yaml';
        const creator = new FileResultCreator(filename);
        expect(creator.isValid()).toBeTruthy();
    });

    it('Should add test suite', () => {
        const filename = 'filename';
        const creator = new FileResultCreator(filename);
        const newTestSuite = {
            name: 'someName',
            valid: true,
            startEvent: null
        };
        creator.addTestSuite('name', newTestSuite);
        creator.create();

        const expected = {
            name: filename,
            tests: [],
            valid: true,
            requisitions: [newTestSuite]
        };

        expect(writeFileSyncMock).toHaveBeenCalledWith(filename, JSON.stringify(expected, null, 2));
    });

    it('Should add error', () => {
        const filename = 'filename';
        const creator = new FileResultCreator(filename);
        const description = 'description';
        creator.addError(description);
        creator.create();

        const expected = {
            name: filename,
            tests: [{
                description: description,
                valid: false,
                name: 'Requisition ran'
            }],
            valid: false,
            requisitions: []
        };

        expect(writeFileSyncMock).toHaveBeenCalledWith(filename, JSON.stringify(expected, null, 2));
        expect(creator.isValid()).toBeFalsy();
    });


});

