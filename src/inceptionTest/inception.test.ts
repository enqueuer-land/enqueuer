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

let sleep = (secondsToWait: number): void => {
    var waitTill = new Date(new Date().getTime() + secondsToWait * 1000);
    while (waitTill > new Date()) {}
};

describe("Inception test", () => {
    let beingTested;
    let tester;

    beforeAll(() => {
        removeEveryReportFile();
    });

    it("should run enqueuer to test another enqueuer process", done => {
        jest.setTimeout(10000); // 10 second timeout

        try {
            beingTested = spawn('node',  ['js/index', '--config-file', 'src/inceptionTest/beingTested.yml']);
            sleep(1);

            tester = spawn('node',  ['js/index', '--config-file', 'src/inceptionTest/tester.yml']);
            sleep(3);

            const testerReport = findEveryJsonFile().filter(filename => filename.indexOf("tester") > 0)[0];
            fs.readFile(testerReport, (error: any, data: string) => {
                const fileContent = JSON.parse(data)

                expect(fileContent.valid).toBeTruthy();
                expect(fileContent.errorsDescription.length).toBe(0);
                expect(fileContent.time.hasTimedOut).toBeFalsy();

                expect(fileContent.subscriptionReports.valid).toBeTruthy();
                expect(fileContent.subscriptionReports.errorsDescription.length).toBe(0);

                expect(fileContent.subscriptionReports.subscriptions[0].valid).toBeTruthy();
                expect(fileContent.subscriptionReports.subscriptions[0].errorsDescription.length).toBe(0);
                expect(fileContent.subscriptionReports.subscriptions[0].functionReport.passingTests[0]).toBe("true");

                expect(fileContent.startEventReports.valid).toBeTruthy();
                expect(fileContent.startEventReports.errorsDescription.length).toBe(0);

                tester.on('exit', (statusCode) => {
                    console.log(`Exit status ${statusCode}`)
                    expect(statusCode).toBe(0);
                    // done();
                })
                done();
            });
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

})