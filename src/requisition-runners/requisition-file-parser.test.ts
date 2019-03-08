import {RequisitionFileParser} from './requisition-file-parser';
import * as fs from 'fs';

jest.mock('fs');

describe('RequisitionFileParser', () => {

    it('Should throw invalid file', () => {
        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(() => {
            throw 'error';
        });
        const parser: RequisitionFileParser = new RequisitionFileParser('anyStuff');

        expect(() => parser.parse()).toThrow();
    });

    it('Should set default name', () => {
        const fileContent = 'att: 1';
        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(() => Buffer.from(fileContent));
        const filename = 'anyStuff';
        const parser: RequisitionFileParser = new RequisitionFileParser(filename);

        expect(parser.parse().name).toBe(filename);
    });

    it('Should parse array as just one', () => {
        const requisitions = [
            {
                id: 0
            },
            {
                name: 'named',
                id: 1
            }
        ];
        const fileContent = JSON.stringify(requisitions);
        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(() => Buffer.from(fileContent));
        const filename = 'anyStuff';

        const requisition = new RequisitionFileParser(filename).parse();

        expect(requisition.name).toBe(filename);
        expect(requisition.requisitions![0].name).toBe(`Requisition #0`);
        expect(requisition.requisitions![1].name).toBe(`named`);
    });

    it('Should keep initial id', () => {
        const fileContent: string = JSON.stringify({
            id: 12345
        });
        // @ts-ignore
        fs.readFileSync.mockImplementationOnce(() => Buffer.from(fileContent));
        const requisition = new RequisitionFileParser('anyStuff').parse();
        expect(requisition.id).toBe(12345);
    });

});
