import { spawn } from 'child_process';
import * as fs from 'fs';
import {RequisitionModel} from '../models/outputs/requisition-model';
import {TestModel} from '../models/outputs/test-model';
import {JavascriptObjectNotation} from '../object-notations/javascript-object-notation';

let findEveryJsonFile = (): string[] => {
    let files = [];
    const path = 'src/inception-test/';
    const dirContent = fs.readdirSync(path);
    for (let i = 0; i < dirContent.length; i++) {
        const filename = path + dirContent[i];
        const stat = fs.lstatSync(filename);
        if (!stat.isDirectory() && filename.indexOf('.json') >= 0) {
            files.push(filename);
        }
    }
    return files;
};

let removeEveryReportFile = (): void => {
    findEveryJsonFile().forEach(file => fs.unlinkSync(file));
};

let sleep = (millisecondsToWait: number): void => {
    const waitTill = new Date(new Date().getTime() + millisecondsToWait);
    while (waitTill > new Date()) {
        //wait
    }
};

const findTest = (label: string, tests: TestModel[]): TestModel | undefined => {
    return tests.find((test) => test.name == label);
};

describe('Inception test', () => {
    let beingTested: any;
    let tester: any;

    beforeAll(() => {
        removeEveryReportFile();
    });

    let testDaemonReport = function (innerTest: RequisitionModel) {
        expect(innerTest.valid).toBeTruthy();
        const innerRequisition: RequisitionModel = innerTest.requisitions[0];

        expect(innerRequisition.valid).toBeTruthy();
        expect(innerRequisition.startEvent.publisher).toBeUndefined();
        if (innerRequisition.startEvent.subscription) {
            expect(innerRequisition.startEvent.subscription.valid).toBeTruthy();
            expect(innerRequisition.startEvent.subscription.name).toBeDefined();
            expect(innerRequisition.startEvent.subscription.tests[0].valid).toBeTruthy();
        }
    };

    let testSingleRunReport = function (outterTest: RequisitionModel) {
        expect(outterTest.valid).toBeTruthy();

        outterTest.requisitions.forEach((requisition) => {
            expect(findTest('No time out', requisition.tests)).toBeTruthy();
            expect(requisition.name).toBeDefined();

            expect(requisition.startEvent.publisher).toBeDefined();
            if (requisition.startEvent.publisher) {
                expect(requisition.startEvent.publisher.valid).toBeTruthy();
                expect(requisition.startEvent.publisher.name).toBe('Start event publisher');
                expect(findTest('Response message received', requisition.startEvent.publisher.tests)).toBeTruthy();
            }
        });

    };

    it('should run enqueuer to test another enqueuer process', done => {
        jest.setTimeout(15000);

        let beingTestedLog = '';
        beingTested = spawn('nqr',  ['--config-file', 'src/inception-test/beingTested.yml']);
        beingTested.stdout.on('data', (data: string) => beingTestedLog += data);
        sleep(500);

        tester = spawn('enqueuer',  ['--config-file', 'src/inception-test/tester.yml']);
        // tester.stdout.on('data', (data: string) => console.log('tester: ' + data));

        tester.on('exit', (statusCode: number) => {
            beingTested.kill('SIGINT');
            console.log('beingTested: ' + beingTested);

            expect(statusCode).toBe(0);

            const testerReports = {};
            findEveryJsonFile()
                .filter(filename => filename.indexOf('_test.json') >= 0)
                .forEach(filename => {
                    testerReports[filename] = new JavascriptObjectNotation().loadFromFileSync(filename);
                });

            console.log(Object.keys(testerReports));
            expect(Object.keys(testerReports).length).toBe(4);

            testDaemonReport(testerReports['src/inception-test/tcp_test.json']);
            testDaemonReport(testerReports['src/inception-test/uds_test.json']);
            testDaemonReport(testerReports['src/inception-test/http-server_test.json']);
            testSingleRunReport(testerReports['src/inception-test/outter_test.json']);

            expect(fs.existsSync('/tmp/enqueuer.requisitions')).toBeFalsy();
            done();
        });
    });

    afterAll(() => {
        removeEveryReportFile();
    });

});