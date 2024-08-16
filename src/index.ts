#!/usr/bin/env node
import { EnqueuerStarter } from './enqueuer-starter';
import { EnqueuerAsNodeChildRunner } from './enqueuer-as-node-child-runner';

// It's the executable
if (require.main === module) {
    // It's the a child process
    if (process.send) {
        new EnqueuerAsNodeChildRunner().execute().then((statusCode: number) => process.exit(statusCode));
    } else {
        new EnqueuerStarter().start().then((statusCode: number) => process.exit(statusCode));
    }
}
