import {FileContentMapCreator} from "./file-content-map-creator";
import {Json} from "../object-notations/json";
import {Yaml} from "../object-notations/yaml";
import * as fs from 'fs';
import {Csv} from "../object-notations/csv";

jest.mock('../object-notations/json');
jest.mock('../object-notations/yaml');
jest.mock('../object-notations/csv');
jest.mock('fs');
describe('FileContentMapCreator', () => {

    it('Handle file not found', () => {
        const loadFromFileSyncMock = jest.fn(() => {throw 'err'});
        Json.mockImplementationOnce(() => {
            return {
                loadFromFileSync: loadFromFileSyncMock
            }
        });

        const tag = 'json';
        const filename = 'examples/file-content.json';
        const replaceableKey = tag + '://' + filename;
        const requisition = {value: '<<' + replaceableKey + '>>'};


        const fileMap = new FileContentMapCreator();
        fileMap.createMap(requisition);

        const expected = {};
        expected[replaceableKey] = 'err';
        expect(fileMap.getMap()).toEqual(expected);
        expect(loadFromFileSyncMock).toHaveBeenCalledWith(filename);
    });

    it('Load json tag', () => {
        const fileContent = 'fileContent';
        const loadFromFileSyncMock = jest.fn(() => fileContent);
        Json.mockImplementationOnce(() => {
            return {
                loadFromFileSync: loadFromFileSyncMock
            }
        });

        const tag = 'json';
        const filename = 'examples/file-content.json';
        const replaceableKey = tag + '://' + filename;
        const requisition = {value: '<<' + replaceableKey + '>>'};


        const fileMap = new FileContentMapCreator();
        fileMap.createMap(requisition);

        const expected = {};
        expected[replaceableKey] = fileContent;
        expect(fileMap.getMap()).toEqual(expected);
        expect(loadFromFileSyncMock).toHaveBeenCalledWith(filename);
    });

    it('Load yaml tag', () => {
        const fileContent = 'fileContent';
        const loadFromFileSyncMock = jest.fn(() => fileContent);
        Yaml.mockImplementationOnce(() => {
            return {
                loadFromFileSync: loadFromFileSyncMock
            }
        });

        const tag = 'yaml';
        const filename = 'examples/file-content.yaml';
        const replaceableKey = tag + '://' + filename;
        const requisition = {value: '<<' + replaceableKey + '>>'};


        const fileMap = new FileContentMapCreator();
        fileMap.createMap(requisition);

        const expected = {};
        expected[replaceableKey] = fileContent;
        expect(fileMap.getMap()).toEqual(expected);
        expect(loadFromFileSyncMock).toHaveBeenCalledWith(filename);
    });

    it('Load yml tag', () => {
        const fileContent = 'fileContent';
        const loadFromFileSyncMock = jest.fn(() => fileContent);
        Yaml.mockImplementationOnce(() => {
            return {
                loadFromFileSync: loadFromFileSyncMock
            }
        });

        const tag = 'yml';
        const filename = 'examples/file-content.yml';
        const replaceableKey = tag + '://' + filename;
        const requisition = {value: '<<' + replaceableKey + '>>'};


        const fileMap = new FileContentMapCreator();
        fileMap.createMap(requisition);

        const expected = {};
        expected[replaceableKey] = fileContent;
        expect(fileMap.getMap()).toEqual(expected);
        expect(loadFromFileSyncMock).toHaveBeenCalledWith(filename);
    });

    it('Load csv tag', () => {
        const fileContent = 'fileContent';
        const loadFromFileSyncMock = jest.fn(() => fileContent);
        Csv.mockImplementationOnce(() => {
            return {
                loadFromFileSync: loadFromFileSyncMock
            }
        });

        const tag = 'csv';
        const filename = 'examples/file-content.yml';
        const replaceableKey = tag + '://' + filename;
        const requisition = {value: '<<' + replaceableKey + '>>'};


        const fileMap = new FileContentMapCreator();
        fileMap.createMap(requisition);

        const expected = {};
        expected[replaceableKey] = fileContent;
        expect(fileMap.getMap()).toEqual(expected);
        expect(loadFromFileSyncMock).toHaveBeenCalledWith(filename);
    });

    it('Load tsv tag', () => {
        const fileContent = 'fileContent';
        const loadFromFileSyncMock = jest.fn(() => fileContent);
        const delimiterConstructor = jest.fn(() => {
            return {
                loadFromFileSync: loadFromFileSyncMock
            }
        });
        Csv.mockImplementationOnce(delimiterConstructor);

        const tag = 'tsv';
        const filename = 'examples/file-content.yml';
        const replaceableKey = tag + '://' + filename;
        const requisition = {value: '<<' + replaceableKey + '>>'};


        const fileMap = new FileContentMapCreator();
        fileMap.createMap(requisition);

        const expected = {};
        expected[replaceableKey] = fileContent;
        expect(fileMap.getMap()).toEqual(expected);
        expect(loadFromFileSyncMock).toHaveBeenCalledWith(filename);
        expect(delimiterConstructor).toHaveBeenCalledWith('\t');
    });

    it('Load unknown tag as file', () => {
        const fileContent = 'fileContent';
        const readFileSync = jest.fn(() => Buffer.from(fileContent));
        fs.readFileSync.mockImplementationOnce(readFileSync);

        const tag = 'unknown';
        const filename = 'examples/file-content.unknown';
        const replaceableKey = tag + '://' + filename;
        const requisition = {value: '<<' + replaceableKey + '>>'};


        const fileMap = new FileContentMapCreator();
        fileMap.createMap(requisition);

        const expected = {};
        expected[replaceableKey] = fileContent;
        expect(fileMap.getMap()).toEqual(expected);
        expect(readFileSync).toHaveBeenCalledWith(filename);
    });

    it('Load each key just once', () => {
        const fileContent = 'fileContent';
        const loadFromFileSyncMock = jest.fn(() => fileContent);
        Yaml.mockImplementationOnce(() => {
            return {
                loadFromFileSync: loadFromFileSyncMock
            }
        });

        const tag = 'yaml';
        const filename = 'examples/file-content.yaml';
        const replaceableKey = tag + '://' + filename;
        const requisition = {
            value: '<<' + replaceableKey + '>>',
            second: '{{' + replaceableKey + '}}',
            third: '<<' + replaceableKey + '>>',
        };


        const fileMap = new FileContentMapCreator();
        fileMap.createMap(requisition);

        const expected = {};
        expected[replaceableKey] = fileContent;
        expect(fileMap.getMap()).toEqual(expected);
        expect(loadFromFileSyncMock).toHaveBeenCalledWith(filename);
        expect(loadFromFileSyncMock).toHaveBeenCalledTimes(1);
    });

    it('Handle empty matches', () => {
        const requisition = {
            key: '((I am not a file))',
        };

        const fileMap = new FileContentMapCreator();
        fileMap.createMap(requisition);

        const expected = {};
        expect(fileMap.getMap()).toEqual(expected);
    });

});