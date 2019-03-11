#!/usr/bin/env node
import {EnqueuerStarter} from './enqueuer-starter';

if (require.main === module) {
    new EnqueuerStarter()
        .start()
        .then((statusCode: number) => process.exit(statusCode));
}
