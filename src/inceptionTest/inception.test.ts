const { spawn } = require('child_process');
const fs = require("fs");

let findEveryJsonFile = (): string[] => {
    let files = [];
    const path = "src/inceptionTest/";
    var dirContent = fs.readdirSync(path);
    for (var i = 0; i < dirContent.length; i++) {
        var filename = path + dirContent[i];
        var stat = fs.lstatSync(filename);
        if (!stat.isDirectory() && filename.indexOf(".json") >= 0) {
            files.push(filename);
        }
    }
    return files;
}

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

    it("should run enqueuer to test another enqueuer process", done => {
        jest.setTimeout(10000);

        try {
            beingTested = spawn('enqueuer',  ['--config-file', 'src/inceptionTest/beingTested.yml']);
            beingTested.stdout.on('data', (data: string) => console.log('beingTested: ' + data));
            sleep(500);

            tester = spawn('enqueuer',  ['--config-file', 'src/inceptionTest/tester.yml']);
            tester.stdout.on('data', (data: string) => console.log('tester: ' + data));
            sleep(2500);

            const testerReports = findEveryJsonFile()
                .filter(filename => filename.indexOf("_test_") >= 0)
                .map(filename => fs.readFileSync(filename))
                .map(fileContent => JSON.parse(fileContent))

            expect(testerReports.length).toBe(2);
            const finalReport = testerReports[1];

            expect(finalReport.valid).toBeTruthy();
            expect(finalReport.time.hasTimedOut).toBeFalsy();

            expect(finalReport.subscriptions.valid).toBeTruthy();

            expect(finalReport.subscriptions.subscriptionFile.valid).toBeTruthy();
            expect(finalReport.subscriptions.subscriptionFile.onMessageFunctionReport.tests[0].name).toBe("true");

            expect(finalReport.runnableFilePublisher.valid).toBeTruthy();

            tester.on('exit', (statusCode) => {
                expect(statusCode).toBe(0);
            })
                done();
        } catch (err) {
            console.error(err)
        }

    })

    afterAll(() => {
        killThemAll();
        removeEveryReportFile();
    })

    let killThemAll = () => {
        beingTested.kill('SIGINT');
        tester.kill('SIGINT');
    };

});