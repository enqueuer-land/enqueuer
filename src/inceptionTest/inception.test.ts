const { spawn } = require('child_process');
const fs = require("fs");


describe("Inception test", () => {
    let beingTested;
    let tester;

    beforeAll(() => {
        const path = "src/inceptionTest/";
        var files=fs.readdirSync(path);
        for(var i=0;i<files.length;i++){
            var filename=path + files[i];
            var stat = fs.lstatSync(filename);
            if (!stat.isDirectory() && filename.indexOf(".json")>=0) {
                console.log('-- found: ',filename);
                fs.unlink(filename)
            };
        }
    });

    it("should run enqueuer to test another enqueuer process", () => {

        try {
            beingTested = spawn('enqueuer',  ['--config-file', 'src/inceptionTest/beingTested.yml']);

            var waitTill = new Date(new Date().getTime() + 5 * 1000);
            while(waitTill > new Date()){}

            tester = spawn('enqueuer',  ['--config-file', 'src/inceptionTest/tester.yml']);

            tester.stdout.on('data', (data) => {
                console.log(`tester stdout:\n${data}`);
            });


            beingTested.stdout.on('data', (data) => {
                console.log(`beingTested stdout:\n${data}`);
            });


        } catch (err) {
            console.error(err)
        }

    })

    let killThemAll = () => {
        beingTested.kill('SIGINT');
        tester.kill('SIGINT');
    };

})