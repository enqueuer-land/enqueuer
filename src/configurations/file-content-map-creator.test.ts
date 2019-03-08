import {FileContentMapCreator} from './file-content-map-creator';
import * as fs from 'fs';
import {Container} from 'conditional-injector';

jest.mock('conditional-injector');
jest.mock('fs');
describe('FileContentMapCreator', () => {

    it('Handle exceptions', () => {
        const loadFromFileSyncMock = jest.fn(() => {
            throw 'err';
        });
        // @ts-ignore
        Container.subclassesOf.mockImplementationOnce(() => {
            return {
                create: () => {
                    return {
                        loadFromFileSync: loadFromFileSyncMock
                    };
                }
            };
        });
        const tag = 'any';
        const filename = 'examples/file-content.any';
        const replaceableKey = tag + '://' + filename;
        const requisition = {value: '<<' + replaceableKey + '>>'};

        // @ts-ignore
        const fileMap = new FileContentMapCreator(requisition);

        const expected: any = {};
        expected[replaceableKey] = 'err';
        expect(fileMap.getMap()).toEqual(expected);
        expect(loadFromFileSyncMock).toHaveBeenCalledWith(filename);
    });

    it('Load tag', () => {
        const fileContent = 'fileContent';
        const loadFromFileSyncMock = jest.fn(() => fileContent);
        // @ts-ignore
        Container.subclassesOf.mockImplementationOnce(() => {
            return {
                create: () => {
                    return {
                        loadFromFileSync: loadFromFileSyncMock
                    };
                }
            };
        });

        const tag = 'tag';
        const filename = 'examples/file-content.tag';
        const replaceableKey = tag + '://' + filename;
        const requisition = {value: '<<' + replaceableKey + '>>'};

        // @ts-ignore
        const fileMap = new FileContentMapCreator(requisition);

        const expected: any = {};
        expected[replaceableKey] = fileContent;
        expect(fileMap.getMap()).toEqual(expected);
        expect(loadFromFileSyncMock).toHaveBeenCalledWith(filename);
    });

    it('Load unknown tag as file', () => {
        const fileContent = 'fileContent';
        const readFileSync = jest.fn(() => Buffer.from(fileContent));
        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(readFileSync);
        // @ts-ignore
        Container.subclassesOf.mockImplementationOnce(() => {
            return {
                create: () => {/*not empty*/
                }
            };
        });

        const tag = 'unknown';
        const filename = 'examples/file-content.unknown';
        const replaceableKey = tag + '://' + filename;
        const requisition = {value: '<<' + replaceableKey + '>>'};

        // @ts-ignore
        const fileMap = new FileContentMapCreator(requisition);

        const expected: any = {};
        expected[replaceableKey] = fileContent;
        expect(fileMap.getMap()).toEqual(expected);
        expect(readFileSync).toHaveBeenCalledWith(filename);
    });

    it('Load each key just once', () => {
        const fileContent = 'fileContent';
        const loadFromFileSyncMock = jest.fn(() => fileContent);
        // @ts-ignore
        Container.subclassesOf.mockImplementationOnce(() => {
            return {
                create: () => {
                    return {
                        loadFromFileSync: loadFromFileSyncMock
                    };
                }
            };
        });

        const tag = 'yaml';
        const filename = 'examples/file-content';
        const replaceableKey = tag + '://' + filename;
        const requisition = {
            value: '<<' + replaceableKey + '>>',
            second: '{{' + replaceableKey + '}}',
            third: '<<' + replaceableKey + '>>',
        };

        // @ts-ignore
        const fileMap = new FileContentMapCreator(requisition);

        const expected: any = {};
        expected[replaceableKey] = fileContent;
        expect(fileMap.getMap()).toEqual(expected);
        expect(loadFromFileSyncMock).toHaveBeenCalledWith(filename);
        expect(loadFromFileSyncMock).toHaveBeenCalledTimes(1);
    });

    it('Handle empty matches', () => {
        const requisition = {
            key: '((I am not a file))',
        };

        // @ts-ignore
        const fileMap = new FileContentMapCreator(requisition);

        const expected: any = {};
        expect(fileMap.getMap()).toEqual(expected);
    });

});
