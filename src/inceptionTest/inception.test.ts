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
            beingTested = spawn('node',  ['js/index', '--config-file', 'src/inceptionTest/beingTested.yml']);
            sleep(500);

            tester = spawn('node',  ['js/index', '--config-file', 'src/inceptionTest/tester.yml']);
            sleep(2500);

            const testerReports = findEveryJsonFile()
                .filter(filename => filename.indexOf("_test_") >= 0)
                .map(filename => fs.readFileSync(filename))
                .map(fileContent => JSON.parse(fileContent))

            expect(testerReports.length).toBe(2);
            const finalReport = testerReports[1];

            expect(finalReport.valid).toBeTruthy();
            expect(finalReport.errorsDescription.length).toBe(0);
            expect(finalReport.time.hasTimedOut).toBeFalsy();

            expect(finalReport.subscriptionReports.valid).toBeTruthy();
            expect(finalReport.subscriptionReports.errorsDescription.length).toBe(0);

            expect(finalReport.subscriptionReports.subscriptions[0].valid).toBeTruthy();
            expect(finalReport.subscriptionReports.subscriptions[0].errorsDescription.length).toBe(0);
            expect(finalReport.subscriptionReports.subscriptions[0].onMessageFunctionReport.passingTests[0]).toBe("true");

            expect(finalReport.startEventReports.valid).toBeTruthy();
            expect(finalReport.startEventReports.errorsDescription.length).toBe(0);

            tester.on('exit', (statusCode) => {
                console.log(`Exit status ${statusCode}`)
                expect(statusCode).toBe(0);
                done();
            })
        } catch (err) {
            // console.error(err)
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