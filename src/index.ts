import {Enqueuer} from "./runner/enqueuer";
import {Configuration} from "./conf/configuration";

new Enqueuer().execute(Configuration.getReaders());
//
// var http = require('http');
//
// //No browser: http://localhost:3000/
//
// http.createServer(onRequest).listen(3000);
//
// function onRequest(client_req: any, client_res: any) {
//     console.log('serve: ' + client_req.url);
//
//     var options = {
//         hostname: 'www.google.com',
//         port: 80,
//         path: client_req.url,
//         method: 'GET'
//     };
//
//     var proxy = http.request(options, function (res: any) {
//         res.pipe(client_res, {
//             end: true
//         });
//     });
//
//     client_req.pipe(proxy, {
//         end: true
//     });
// }