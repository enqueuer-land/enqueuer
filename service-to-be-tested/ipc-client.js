const ipc = require('node-ipc');

ipc.config.id = 'client';
// ipc.config.retry = 1500;
// ipc.config.silent = false;
ipc.connectTo('enqueuer', (client) => {
    client.of['enqueuer'].on('connect', () => {
        client.of['enqueuer'].emit('enqueuer-client', "The message client sends");
        
        client.of['enqueuer'].on('message', message => {
            console.log("DEU: "+ JSON.stringify(message))
            process.exit(0);
        });
  });
});
