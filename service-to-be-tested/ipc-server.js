const ipc = require('node-ipc');

ipc.config.id = 'enqueuer';
ipc.config.retry = 1500;
ipc.config.silent = true;
ipc.serve(() => {
    console.log(message);

    ipc.server.on('enqueuer-client', (message, socket) => {

        // ipc.server.on(
        //     'message',
        //     function(data, socket){
        //         ipc.log('got a message : '.debug, data);
        //         ipc.server.emit(
        //             socket,
        //             'message',  //this can be anything you want so long as
        //                         //your client knows.
        //             data+' world!'
        //         );
        //         ipc.server.emit("The message server sends");
        //     }
        // );
        // ipc.server.on(
        //     'disconnected',
        //     function(socket, destroyedSocketID) {
        //         ipc.log('client ' + destroyedSocketID + ' has disconnected!');
        //     }
        // );


        console.log(message);
        // From here I can do ipc.server.emit(socket, 'message', {});
        ipc.server.emit(socket, 'message', {attribute:"gui"});


    });
});

ipc.server.start();