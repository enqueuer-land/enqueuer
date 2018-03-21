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

    it("should run enqueuer to test another enqueuer process", () => {

        try {
            beingTested = spawn('enqueuer',  ['--config-file', 'src/inceptionTest/beingTested.yml']);

            beingTested.stdout.on('data', (data) => {
                console.log(`beingTested stdout:\n${data}`);
            });

            sleep(3);

            tester = spawn('enqueuer',  ['--config-file', 'src/inceptionTest/tester.yml']);

            tester.stdout.on('data', (data) => {
                console.log(`tester stdout:\n${data}`);
            });

            sleep(5);

            findEveryJsonFile().forEach(file => console.log("end: " + file));
            killThemAll()

        } catch (err) {
            console.error(err)
        }

    })

    afterAll(() => {
        // removeEveryReportFile();
    })
    let killThemAll = () => {
        beingTested.kill('SIGINT');
        tester.kill('SIGINT');
    };

})