import {FileContentMapCreator} from "./file-content-map-creator";
import {JavascriptObjectNotation} from "../object-notations/javascript-object-notation";
import {YamlObjectNotation} from "../object-notations/yaml-object-notation";
import * as fs from 'fs';

jest.mock('../object-notations/javascript-object-notation');
jest.mock('../object-notations/yaml-object-notation');
jest.mock('fs');
describe('FileContentMapCreator', () => {

    it('Load json tag', () => {
        const fileContent = 'fileContent';
        const loadFromFileSyncMock = jest.fn(() => fileContent);
        JavascriptObjectNotation.mockImplementationOnce(() => {
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

    it('Load yml tag', () => {
        const fileContent = 'fileContent';
        const loadFromFileSyncMock = jest.fn(() => fileContent);
        YamlObjectNotation.mockImplementationOnce(() => {
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
        YamlObjectNotation.mockImplementationOnce(() => {
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