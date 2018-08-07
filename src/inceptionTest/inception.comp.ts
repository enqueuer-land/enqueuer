import { spawn } from 'child_process';
import * as fs from 'fs';
import {RequisitionModel} from '../models/outputs/requisition-model';

let findEveryJsonFile = (): string[] => {
    let files = [];
    const path = 'src/inceptionTest/';
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

describe('Inception test', () => {
    let beingTested: any;
    let tester: any;

    beforeAll(() => {
        removeEveryReportFile();
    });

    it('should run enqueuer to test another enqueuer process', done => {
        jest.setTimeout(10000);

        beingTested = spawn('nqr',  ['--config-file', 'src/inceptionTest/beingTested.yml']);
        // beingTested.stdout.on('data', (data: string) => console.log('beingTested: ' + data));
        sleep(500);

        tester = spawn('enqueuer',  ['--config-file', 'src/inceptionTest/tester.yml']);
        // tester.stdout.on('data', (data: string) => console.log('tester: ' + data));
        sleep(2500);

        const testerReports = findEveryJsonFile()
            .filter(filename => filename.indexOf('_test.') >= 0)
            .map(filename => fs.readFileSync(filename))
            .map(fileContent => JSON.parse(fileContent.toString()));

        expect(testerReports.length).toBe(2);

        const innerTest = testerReports[0];
        expect(innerTest.valid).toBeTruthy();
        const innerReport: RequisitionModel = innerTest.runnables[0];

        expect(innerReport.tests['No time out']).toBeTruthy();
        expect(innerReport.name).toBe('innerRunnableUds');

        expect(innerReport.subscriptions[0].valid).toBeTruthy();
        expect(innerReport.subscriptions[0].tests['Connected']).toBeTruthy();
        expect(innerReport.subscriptions[0].tests['Works']).toBeTruthy();
        expect(innerReport.subscriptions[0].tests['Message received']).toBeTruthy();
        expect(innerReport.subscriptions[0].tests['No time out']).toBeTruthy();

        expect(innerReport.startEvent.publisher).toBeDefined();
        if (innerReport.startEvent.publisher) {
            expect(innerReport.startEvent.publisher.valid).toBeTruthy();
            expect(innerReport.startEvent.publisher.name).toBe('runnableUds');
        }

        const outterTest = testerReports[1];
        expect(outterTest.valid).toBeTruthy();
        const outterReport: RequisitionModel = testerReports[1].runnables[0];

        expect(outterReport.tests['No time out']).toBeTruthy();
        expect(outterReport.name).toBe('runnableUds');

        expect(outterReport.subscriptions[0].valid).toBeTruthy();
        expect(outterReport.subscriptions[0].tests['Connected']).toBeTruthy();
        expect(outterReport.subscriptions[0].tests['true']).toBeTruthy();
        expect(outterReport.subscriptions[0].tests['Message received']).toBeTruthy();
        expect(outterReport.subscriptions[0].tests['No time out']).toBeTruthy();

        expect(outterReport.startEvent.publisher).toBeDefined();
        if (outterReport.startEvent.publisher) {
            expect(outterReport.startEvent.publisher.valid).toBeTruthy();
            expect(outterReport.startEvent.publisher.name).toBe('runnableUdsPublisher');
        }

        tester.on('exit', (statusCode: number) => {
            expect(statusCode).toBe(0);
            done();
        });
    });

    let killThemAll = () => {
        beingTested.kill('SIGINT');
        tester.kill('SIGINT');
    };

    afterAll(() => {
        killThemAll();
        removeEveryReportFile();
    });

});