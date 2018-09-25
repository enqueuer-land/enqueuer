#!/usr/bin/env node
const readline = require('readline');
const packageJson = require('../package.json');
const fs = require('fs');

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

var installThemAll = function () {
    for (var index = 0; index < optionalDependencies.length; ++index) {
        console.log('Adding ' + optionalDependencies[index].ipc);
        packageJson.dependencies[optionalDependencies[index].package] = optionalDependencies[index].version;
    }
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    process.exit(0);
};
const askDependency = function(dependencies)
{
    if (!dependencies.length) {
        console.log('No more dependency remaining');
        rl.close();
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
        process.exit(0);
    }
    rl.question("Will '"+dependencies[0].ipc+"' be needed? (yes/no) ", function (answer) {
        if (answer === '--install-all-optional-dependencies') {
            installThemAll();
            return;
        } else if (isAffirmative(answer)) {
            console.log('Adding: ' + dependencies[0].ipc);
            packageJson.dependencies[dependencies[0].package] = dependencies[0].version;
        }
        dependencies.shift();
        askDependency(dependencies);
    });
};

askDependency(optionalDependencies.concat([]));


