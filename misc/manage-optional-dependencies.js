#!/usr/bin/env node
const readline = require('readline');
const fs = require('fs');
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
const askDependency = function(dependencies)
{
    if (!dependencies.length) {
        console.log('No more dependency remaining');
        console.log('Installing: ' + toInstall.join(' '));
        rl.close();
        // process.exit(exec('npm install ' + toInstall.join(' ')));
        return;
    }
    rl.question("Will '"+dependencies[0].ipc+"' be needed? (yes/no) ", function (answer) {
        if (answer === '--skip-all-optional-dependencies') {
            process.exit(0);
            return;
        } else if (isAffirmative(answer)) {
            console.log('Adding: ' + dependencies[0].ipc);
            toInstall.push(dependencies[0].package + '@' + dependencies[0].version);
        }
        dependencies.shift();
        askDependency(dependencies);
    });
};

askDependency(optionalDependencies.concat([]));


