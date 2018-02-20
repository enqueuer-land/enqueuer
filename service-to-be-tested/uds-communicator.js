const goodRequisition = require("./goodRequisition");
const badRequisition = require("./badRequisition");

var ipc = require('node-ipc');
var chalk = require('chalk');

const requisition  = JSON.stringify(badRequisition, null, 2);

ipc.config.id = 'enqueuer-client';
// ipc.config.retry = 1500;
ipc.config.silent = true;
ipc.connectTo('enqueuer', (client) => {

    client.of['enqueuer'].on('connect', () => {

        client.of['enqueuer'].on('message', message => {
            const parsedMessage = JSON.parse(message);
            console.log(parsedMessage);
            printInfo(parsedMessage.infoMessages);
            printErrors(parsedMessage.errorMessages);

            process.exit(0);
        });

        client.of['enqueuer'].emit('enqueuer-client', requisition);        
  });
});

printInfo = (infoMessages) => {
    if (infoMessages === undefined || infoMessages.length == 0)
        return;
    console.log(chalk.underline.green("INFO"));
    infoMessages
        .forEach((info) => console.log(chalk.green("\t" + info)));
    };
printErrors = (errorMessages) => {
    if (errorMessages === undefined || errorMessages.length == 0)
        return;
    console.log(chalk.underline.green("ERROR"));
    errorMessages
        .forEach((error) => console.log(chalk.red("\t" + error)));
    };
