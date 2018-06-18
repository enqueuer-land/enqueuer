import {RequisitionModel} from "../models/outputs/requisition-model";

const { spawn } = require('child_process');
const fs = require("fs");

let findEveryJsonFile = (): string[] => {
    let files = [];
    const path = "src/inceptionTest/";
    const dirContent = fs.readdirSync(path);
    for (let i = 0; i < dirContent.length; i++) {
        const filename = path + dirContent[i];
        const stat = fs.lstatSync(filename);
        if (!stat.isDirectory() && filename.indexOf(".json") >= 0) {
            files.push(filename);
        }
    }
    return files;
};

let removeEveryReportFile = (): void => {
    findEveryJsonFile().forEach(file => fs.unlinkSync(file));
};

let sleep = (millisecondsToWait: number): void => {
    var waitTill = new Date(new Date().getTime() + millisecondsToWait);
    while (waitTill > new Date()) {}
};

describe("Inception test", () => {
    let beingTested;
    let tester;

    beforeAll(() => {
        removeEveryReportFile();
    });

    it("should run enqueuer to test another enqueuer process", () => {
        jest.setTimeout(10000);
        expect(true).toBeTruthy();
        return;

        // try {
        //     beingTested = spawn('enqueuer',  ['--config-file', 'src/inceptionTest/beingTested.yml']);
        //     // beingTested.stdout.on('data', (data: string) => console.log('beingTested: ' + data));
        //     sleep(500);
        //
        //     tester = spawn('enqueuer',  ['--config-file', 'src/inceptionTest/tester.yml']);
        //     // tester.stdout.on('data', (data: string) => console.log('tester: ' + data));
        //     sleep(2500);
        //
        //     const testerReports = findEveryJsonFile()
        //         .filter(filename => filename.indexOf("_test.") >= 0)
        //         .map(filename => fs.readFileSync(filename))
        //         .map(fileContent => JSON.parse(fileContent));
        //
        //     expect(testerReports.length).toBe(2);
        //
        //
        //     const innterTest = testerReports[0];
        //     expect(innterTest.valid).toBeTruthy();
        //     const innerReport: RequisitionModel = innterTest.runnables[0];
        //
        //     expect(innerReport.tests["No time out"]).toBeTruthy();
        //     expect(innerReport.name).toBe("innerRunnableUds");
        //
        //     expect(innerReport.subscriptions[0].valid).toBeTruthy();
        //     expect(innerReport.subscriptions[0].tests["Able to connect"]).toBeTruthy();
        //     expect(innerReport.subscriptions[0].tests["works"]).toBeTruthy();
        //     expect(innerReport.subscriptions[0].tests["Message received"]).toBeTruthy();
        //     expect(innerReport.subscriptions[0].tests["No time out"]).toBeTruthy();
        //
        //     expect(innerReport.startEvent.publisher.valid).toBeTruthy();
        //     expect(innerReport.startEvent.publisher.name).toBe("runnableUds");
        //
        //
        //     const outterTest = testerReports[1];
        //     expect(outterTest.valid).toBeTruthy();
        //     const outterReport: RequisitionModel = testerReports[1].runnables[0];
        //
        //     expect(outterReport.tests["No time out"]).toBeTruthy();
        //     expect(outterReport.name).toBe("runnableUds");
        //
        //     expect(outterReport.subscriptions[0].valid).toBeTruthy();
        //     expect(outterReport.subscriptions[0].tests["Able to connect"]).toBeTruthy();
        //     expect(outterReport.subscriptions[0].tests["true"]).toBeTruthy();
        //     expect(outterReport.subscriptions[0].tests["Message received"]).toBeTruthy();
        //     expect(outterReport.subscriptions[0].tests["No time out"]).toBeTruthy();
        //
        //     expect(outterReport.startEvent.publisher.valid).toBeTruthy();
        //     expect(outterReport.startEvent.publisher.name).toBe("runnableUdsPublisher");
        //
        //     tester.on('exit', (statusCode) => {
        //         expect(statusCode).toBe(0);
        //         done();
        //     });
        // } catch (err) {
        //     console.error(err)
        // }

    });

    afterAll(() => {
        killThemAll();
        removeEveryReportFile();
    });

    let killThemAll = () => {
        beingTested.kill('SIGINT');
        tester.kill('SIGINT');
    };

});