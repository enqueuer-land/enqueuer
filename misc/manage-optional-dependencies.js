#!/usr/bin/env node
const readline = require('readline');
const exec = require('child_process').exec;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const isAffirmative = function (answer) {
    return answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y' || answer.toLowerCase() === 'true';
};

const optionalDependencies = [
    { ipc: 'amqp', package: 'amqp', version: '^0.2.7'},
    { ipc: 'http', package: 'express', version: '^4.16.3'},
    { ipc: 'kafka', package: 'kafka-node', version: '^3.0.1'},
    { ipc: 'mqtt', package: 'mqtt', version: '^2.18.8'},
    { ipc: 'sqs', package: 'aws-sdk', version: '^2.318.0'},
    { ipc: 'stomp', package: 'stomp-client', version: '^0.9.0'},
    { ipc: 'zeroMq', package: 'zeromq', version: '^4.6.0'}
];

var toInstall = [];

const install = function () {
    const packages = toInstall.join(' ');
    console.log('Installing: ' + packages);
    rl.close();
    exec('npm install ' + packages, function (error, stdout, stderr) {
        if (error) {
            console.log('Errored: ' + error);
            console.log(stderr);
        }
        process.exit(0);
    });
};

var timeout;
var currentDependency;
const askDependency = function()
{
    currentDependency = optionalDependencies[0];
    optionalDependencies.shift();
    if (!optionalDependencies.length) {
        if ( toInstall.length > 0) {
            install();
        } else {
            process.exit(0);
        }
    } else {
        timeout = setTimeout(function() {
            console.log('Took to long to reply. Assuming you don\'t need \''+currentDependency.ipc+'\'. Be faster next time');
            askDependency();
        }, 5000);

        console.log("Will '"+currentDependency.ipc+"' be needed? (yes/no) ");
        rl.prompt(true);
    }
};

rl.on("line", function (answer) {
    if (answer === '--skip-all-optional-dependencies') {
        process.exit(0);
        return;
    } else if (isAffirmative(answer)) {
        console.log('Adding: ' + currentDependency.ipc);
        toInstall.push(currentDependency.package + '@' + currentDependency.version);
    }
    clearTimeout(timeout);
    askDependency();
});

askDependency();


