import prettyjson from 'prettyjson';
import {ReportFormatterManager} from './report-formatter-manager';
import {JsonReportFormatter} from '../outputs/formatters/json-formatter';

jest.mock('prettyjson');

const render = jest.fn();
// @ts-ignore
prettyjson.render.mockImplementation(render);

describe('ReportFormatterManager', () => {
    beforeEach(() => {
        render.mockClear();
    });

    it('describeFormats', () => {
        const reportFormatterManager = new ReportFormatterManager();
        // @ts-ignore
        reportFormatterManager.addReportFormatter(
            () => {
                /**/
            },
            'first',
            '1st'
        );
        // @ts-ignore
        reportFormatterManager.addReportFormatter(() => {
            /**/
        }, 'second');
        // @ts-ignore

        expect(reportFormatterManager.describeMatchingReportFormatters(true)).toBeTruthy();
        expect(render).toHaveBeenCalledWith(
            {
                formatters: [['first', '1st'], ['second']]
            },
            expect.anything()
        );
    });

    it('should create right formatter', (done) => {
        // @ts-ignore
        const reportFormatterManager = new ReportFormatterManager();
        reportFormatterManager.addReportFormatter(() => done(), 'tag');
        reportFormatterManager.createReportFormatter('tag');
    });

    it('should create right formatter ignoring case', (done) => {
        // @ts-ignore
        const reportFormatterManager = new ReportFormatterManager();
        reportFormatterManager.addReportFormatter(() => done(), 'TaG');
        reportFormatterManager.createReportFormatter('tag');
    });

    it('should create Default formatter', () => {
        const formatter = new ReportFormatterManager().createReportFormatter('unknown');
        expect(formatter).toBeInstanceOf(JsonReportFormatter);
    });

    it('describe given formatter', () => {
        const reportFormatterManager = new ReportFormatterManager();
        // @ts-ignore
        reportFormatterManager.addReportFormatter(
            () => {
                /**/
            },
            'tag',
            'another'
        );
        // @ts-ignore
        reportFormatterManager.addReportFormatter(() => {
            /**/
        }, 'second');
        expect(reportFormatterManager.describeMatchingReportFormatters('tag')).toBeTruthy();
        expect(render).toHaveBeenCalledWith(
            {
                formatters: [['tag', 'another']]
            },
            expect.anything()
        );
    });

    it('describe given formatter not string param', () => {
        const reportFormatterManager = new ReportFormatterManager();
        // @ts-ignore
        reportFormatterManager.addReportFormatter(
            () => {
                /**/
            },
            'tag',
            'another'
        );
        // @ts-ignore
        reportFormatterManager.addReportFormatter(() => {
            /**/
        }, 'second');
        expect(reportFormatterManager.describeMatchingReportFormatters(true)).toBeTruthy();
        expect(render).toHaveBeenCalledWith(
            {
                formatters: [['tag', 'another'], ['second']]
            },
            expect.anything()
        );
    });

    it('error describe given formatter', () => {
        const reportFormatterManager = new ReportFormatterManager();
        // @ts-ignore
        reportFormatterManager.addReportFormatter(
            () => {
                /**/
            },
            'tag',
            'another'
        );
        expect(reportFormatterManager.describeMatchingReportFormatters('unknown')).toBeFalsy();
    });
});
