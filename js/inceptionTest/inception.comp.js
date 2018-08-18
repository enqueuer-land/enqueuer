"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
let findEveryJsonFile = () => {
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
let removeEveryReportFile = () => {
    findEveryJsonFile().forEach(file => fs.unlinkSync(file));
};
let sleep = (millisecondsToWait) => {
    const waitTill = new Date(new Date().getTime() + millisecondsToWait);
    while (waitTill > new Date()) {
        //wait
    }
};
const findTest = (label, tests) => {
    return tests.find((test) => test.name == label);
};
describe('Inception test', () => {
    let beingTested;
    let tester;
    beforeAll(() => {
        removeEveryReportFile();
    });
    it('should run enqueuer to test another enqueuer process', done => {
        jest.setTimeout(10000);
        beingTested = child_process_1.spawn('nqr', ['--config-file', 'src/inceptionTest/beingTested.yml']);
        beingTested.stdout.on('data', (data) => console.log('beingTested: ' + data));
        sleep(500);
        tester = child_process_1.spawn('enqueuer', ['--config-file', 'src/inceptionTest/tester.yml']);
        // tester.stdout.on('data', (data: string) => console.log('tester: ' + data));
        sleep(2500);
        const testerReports = findEveryJsonFile()
            .filter(filename => filename.indexOf('_test.') >= 0)
            .map(filename => fs.readFileSync(filename))
            .map(fileContent => JSON.parse(fileContent.toString()));
        expect(testerReports.length).toBe(2);
        const innerTest = testerReports[0];
        expect(innerTest.valid).toBeTruthy();
        const innerReport = innerTest.runnables[0];
        expect(innerReport.name).toBe('innerRunnableUds');
        expect(innerReport.subscriptions[0].valid).toBeTruthy();
        expect(findTest('Works', innerReport.subscriptions[0].tests)).toBeTruthy();
        expect(findTest('Message received', innerReport.subscriptions[0].tests)).toBeTruthy();
        expect(innerReport.startEvent.publisher).toBeDefined();
        if (innerReport.startEvent.publisher) {
            expect(innerReport.startEvent.publisher.valid).toBeTruthy();
            expect(innerReport.startEvent.publisher.name).toBe('runnablePubsUds');
        }
        const outterTest = testerReports[1];
        expect(outterTest.valid).toBeTruthy();
        const outterReport = testerReports[1].runnables[0];
        expect(findTest('No time out', outterReport.tests)).toBeTruthy();
        expect(outterReport.name).toBe('runnableUds');
        expect(outterReport.subscriptions[0].valid).toBeTruthy();
        expect(findTest('Message received', outterReport.subscriptions[0].tests)).toBeTruthy();
        expect(findTest('No time out', outterReport.subscriptions[0].tests)).toBeTruthy();
        expect(outterReport.startEvent.publisher).toBeDefined();
        if (outterReport.startEvent.publisher) {
            expect(outterReport.startEvent.publisher.valid).toBeTruthy();
            expect(outterReport.startEvent.publisher.name).toBe('runnableUdsPublisher');
        }
        tester.on('exit', (statusCode) => {
            expect(statusCode).toBe(0);
            done();
        });
    });
    let killThemAll = () => {
        beingTested.kill('SIGINT');
        // tester.kill('SIGINT');
    };
    afterAll(() => {
        killThemAll();
        removeEveryReportFile();
    });
});
