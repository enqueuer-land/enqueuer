import {FileConfiguration} from './file-configuration';
import {YmlObjectParser} from '../object-parser/yml-object-parser';
import * as fs from 'fs';

jest.mock('../object-parser/yml-object-parser');
jest.mock('fs');

fs.readFileSync.mockImplementation(() => 'fileContent');

describe('FileConfiguration', () => {

    it('Throw error', () => {
        // @ts-ignore
        YmlObjectParser.mockImplementationOnce(() => {
            return {
                parse: () => {
                    throw 'error';
                }
            };
        });

        const filename = 'filename';

        expect(() => new FileConfiguration(filename)).toThrow();
    });

    it('get values', () => {
        YmlObjectParser.mockImplementationOnce(() => {
            return {
                parse: () => {
                    return {
                        'log-level': 'logEnqueuer',
                        outputs: ['outputs'],
                        parallel: true,
                        files: ['1', '2'],
                        plugins: ['plugin1', 'plugin2'],
                        maxReportLevelPrint: 10,
                        store: {
                            key: 'value',
                            otherKey: 123
                        }
                    };
                }
            };
        });
        const fileConfiguration = new FileConfiguration('itDoesNotMatter');

        expect(fileConfiguration.getOutputs()).toEqual(['outputs']);
        expect(fileConfiguration.isParallelExecution()).toBeTruthy();
        expect(fileConfiguration.getFiles()).toEqual(['1', '2']);
        expect(fileConfiguration.getMaxReportLevelPrint()).toBe(10);
        expect(fileConfiguration.getPlugins()).toEqual(['plugin1', 'plugin2']);
        expect(fileConfiguration.getStore()).toEqual(
            {
                key: 'value',
                otherKey: 123
            });
    });

    it('get default', () => {
        // @ts-ignore
        YmlObjectParser.mockImplementationOnce(() => {
            return {
                parse: () => {
                    return {};
                }
            };
        });
        const fileConfiguration = new FileConfiguration('itDoesNotMatter');

        expect(fileConfiguration.getOutputs()).toEqual([]);
        expect(fileConfiguration.isParallelExecution()).toBeFalsy();
        expect(fileConfiguration.getFiles()).toEqual([]);
        expect(fileConfiguration.getMaxReportLevelPrint()).toBeUndefined();
        expect(fileConfiguration.getPlugins()).toEqual([]);
        expect(fileConfiguration.getStore()).toEqual({});

    });

});
