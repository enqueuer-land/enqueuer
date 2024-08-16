import {FileContentMapCreator} from './file-content-map-creator';
import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';
import * as fs from 'fs';

jest.mock('../plugins/dynamic-modules-manager');
jest.mock('fs');
describe('FileContentMapCreator', () => {
    it('Handle exceptions', () => {
        const readFileSyncMock = jest.fn(() => {
            throw 'err';
        });
        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(readFileSyncMock);

        const tag = 'any';
        const filename = 'examples/file-content.any';
        const replaceableKey = tag + '://' + filename;
        const requisition = {value: '<<' + replaceableKey + '>>'};

        // @ts-ignore
        const fileMap = new FileContentMapCreator(requisition);

        const expected: any = {};
        expected[replaceableKey] = 'err';
        expect(fileMap.getMap()).toEqual(expected);
        expect(readFileSyncMock).toHaveBeenCalledWith(filename);
    });

    it('Handle exceptions undefined field', () => {
        const requisition = {value: undefined};

        // @ts-ignore
        expect(() => new FileContentMapCreator(requisition)).not.toThrow();
    });

    it('Parse from file with right parser', () => {
        const fileContent = 'fileContent';
        const readFileSyncMock = jest.fn(() => fileContent);
        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(readFileSyncMock);

        const tag = 'tag';
        const filename = 'examples/file-content.tag';
        const replaceableKey = tag + '://' + filename;
        const requisition = {value: '<<' + replaceableKey + '>>'};

        // @ts-expect-error
        DynamicModulesManager.getInstance.mockImplementation(() => {
            return {
                getObjectParserManager: () => {
                    return {
                        createParser: () => {
                            return {
                                parse: () => fileContent
                            };
                        }
                    };
                }
            };
        });

        // @ts-ignore
        const fileMap = new FileContentMapCreator(requisition);

        const expected: any = {};
        expected[replaceableKey] = fileContent;
        expect(fileMap.getMap()).toEqual(expected);
        expect(readFileSyncMock).toHaveBeenCalledWith(filename);
    });

    it('Load unknown tag as a regular file', () => {
        const fileContent = 'fileContent';
        const readFileSync = jest.fn(() => Buffer.from(fileContent));
        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(readFileSync);

        const tag = 'unknown';
        const filename = 'examples/file-content.unknown';
        const replaceableKey = tag + '://' + filename;
        const requisition = {value: '<<' + replaceableKey + '>>'};

        // @ts-expect-error
        DynamicModulesManager.getInstance.mockImplementation(() => {
            return {
                getObjectParserManager: () => {
                    return {
                        createParser: () => {
                            return {
                                parse: () => {
                                    throw 'not parsed';
                                }
                            };
                        }
                    };
                }
            };
        });

        // @ts-ignore
        const fileMap = new FileContentMapCreator(requisition);

        const expected: any = {};
        expected[replaceableKey] = fileContent;
        expect(fileMap.getMap()).toEqual(expected);
        expect(readFileSync).toHaveBeenCalledWith(filename);
    });

    it('should parse query', () => {
        const fileContent = 'fileContent';
        const readFileSync = jest.fn(() => Buffer.from(fileContent));
        let text;
        let query;

        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(readFileSync);

        const requisition = {
            value: '<<some://filename?delimiter=;&header=false&other>>'
        };

        // @ts-expect-error
        DynamicModulesManager.getInstance.mockImplementation(() => {
            return {
                getObjectParserManager: () => {
                    return {
                        createParser: (tag: string) => {
                            expect(tag).toBe('some');
                            return {
                                parse: (receivedText: string, receivedQuery: any) => {
                                    text = receivedText;
                                    query = receivedQuery;
                                }
                            };
                        }
                    };
                }
            };
        });

        // @ts-ignore
        new FileContentMapCreator(requisition).getMap();
        expect(text).toBe(fileContent);
        expect(query).toEqual({
            delimiter: ';',
            header: 'false',
            other: true,
            tag: 'some',
            filename: 'filename'
        });
    });

    it('Load each key just once', () => {
        const fileContent = 'fileContent';
        const readFileSyncMock = jest.fn(() => Buffer.from(fileContent));
        // @ts-ignore
        fs.readFileSync.mockImplementation(readFileSyncMock);

        const tag = 'tag';
        const filename = 'examples/file-content';
        const replaceableKey = tag + '://' + filename;
        const requisition = {
            value: '<<' + replaceableKey + '>>',
            second: '{{' + replaceableKey + '}}',
            third: '<<' + replaceableKey + '>>'
        };

        // @ts-ignore
        DynamicModulesManager.getInstance.mockImplementation(() => {
            return {
                getObjectParserManager: () => {
                    return {
                        createParser: () => {
                            return {
                                parse: () => fileContent
                            };
                        }
                    };
                }
            };
        });

        // @ts-ignore
        const fileMap = new FileContentMapCreator(requisition);

        const expected: any = {};
        expected[replaceableKey] = fileContent;
        expect(fileMap.getMap()).toEqual(expected);
        expect(readFileSyncMock).toHaveBeenCalledWith(filename);
        expect(readFileSyncMock).toHaveBeenCalledTimes(1);
    });

    it('Handle empty matches', () => {
        const requisition = {
            key: '((I am not a file))'
        };

        // @ts-ignore
        const fileMap = new FileContentMapCreator(requisition);

        const expected: any = {};
        expect(fileMap.getMap()).toEqual(expected);
    });
});
