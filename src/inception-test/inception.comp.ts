import {spawn} from 'child_process';
import * as fs from 'fs';
import {RequisitionModel} from '../models/outputs/requisition-model';
import {TestModel} from '../models/outputs/test-model';
import {JavascriptObjectNotation} from '../object-notations/javascript-object-notation';
import {ConfigurationValues} from "../configurations/configuration-values";
import '../injectable-files-list'

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

const testerConfiguration: ConfigurationValues = {
    logLevel: 'warn',
    runMode: {
        'single-run': {
            reportName: "src/inception-test/singleRunInceptionReport.json",
            files: [
                "src/inception-test/inceptionRequisition.yml",
                "src/inception-test/inceptionRequisition.yml"
            ],
            parallel: true
        }
    },
    outputs: [
        {
            "type": "file",
            "filename": "src/inception-test/outter_test.json"
        }
    ],
    quiet: false
}

describe('Inception test', () => {
    let beingTested: any;
    let second: any;

    beforeAll(() => {
        if (fs.existsSync('/tmp/enqueuer.requisitions'))
            fs.unlinkSync('/tmp/enqueuer.requisitions');
        removeEveryReportFile();
    });

    let testDaemonReport = function (innerTest: RequisitionModel) {
        expect(innerTest.valid).toBeTruthy();
        const innerRequisition: RequisitionModel = innerTest.requisitions[0];

        expect(innerRequisition.valid).toBeTruthy();
        if (innerRequisition.subscriptions[0]) {
            expect(innerRequisition.subscriptions[0].valid).toBeTruthy();
            expect(innerRequisition.subscriptions[0].name).toBeDefined();
            expect(innerRequisition.subscriptions[0].tests[0].valid).toBeTruthy();
        }
    };

    let testSingleRunReport = function (outterTest: RequisitionModel) {
        expect(outterTest.valid).toBeTruthy();

        outterTest.requisitions.forEach((requisition) => {
            expect(findTest('No time out', requisition.tests)).toBeTruthy();
            expect(requisition.name).toBeDefined();

            expect(requisition.publishers).toBeDefined();
            if (requisition.publishers[0]) {
                expect(requisition.publishers[0].valid).toBeTruthy();
                expect(requisition.publishers[0].name).toBe('Publisher #0');
                expect(findTest('Response message received', requisition.publishers[0].tests)).toBeTruthy();
            }
        });

    };

    it('should run enqueuer to test another enqueuer process', done => {
        jest.setTimeout(15000);

        let beingTestedLog = '';
        beingTested = spawn('nqr', ['src/inception-test/beingTested.yml']);
        beingTested.stdout.on('data', (data: string) => beingTestedLog += data);
        sleep(500);

        // new EnqueuerStarter(testerConfiguration)
        //     .start()
        //     .then((statusCode: number) => {

        second = spawn('enqueuer',  ['src/inception-test/tester.yml']);
        // tester.stdout.on('data', (data: string) => console.log('tester: ' + data));
        second.on('exit', (statusCode: number) => {
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

                beingTested.kill('SIGINT');
            });

        beingTested.on('exit', (statusCode: number) => {
            expect(fs.existsSync('/tmp/enqueuer.requisitions')).toBeFalsy();
            console.log('beingTested: ' + beingTestedLog);
            expect(statusCode).toEqual(0);
            done();
        });

    });

    it('Should quit second daemon properly', done => {
        jest.setTimeout(15000);

        const first = spawn('nqr', ['src/inception-test/beingTested.yml']);
        sleep(500);

        second = spawn('enqueuer',  ['src/inception-test/beingTested.yml']);
        second.on('exit', (statusCode: number) => {
            expect(statusCode).toBe(255);
            first.kill('SIGINT');
        });

        first.on('exit', (statusCode: number) => {
            expect(statusCode).toEqual(0);
            done();
        });

    });

    afterEach(() => {
        removeEveryReportFile();
    });

});