import {Enqueuer} from "./enqueuer";
import {Configuration} from "./configurations/configuration";

new Enqueuer().execute(Configuration.getReaders());
// //
// // var http = require('http');
// //
// // //No browser: http://localhost:3000/
// //
// // http.createServer(onRequest).listen(3000);
// //
// // function onRequest(client_req: any, client_res: any) {
// //     console.log('serve: ' + client_req.url);
// //
// //     var options = {
// //         hostname: 'www.google.com',
// //         port: 80,
// //         path: client_req.url,
// //         method: 'GET'
// //     };
// //
// //     var proxy = http.request(options, function (res: any) {
// //         res.pipe(client_res, {
// //             end: true
// //         });
// //     });
// //
// //     client_req.pipe(proxy, {
// //         end: true
// //     });
// // }

// function CustomDecorator(data: any) {
//     console.log("HAHAHA: " + data);
//     return function (target: Function) {
//         console.log("Sub: " + target.prototype.constructor.name)
//         var parentTarget = Object.getPrototypeOf(target.prototype).constructor;
//         console.log(parentTarget === AbstractClass); // true :)
//
//     }
// }
//
// function activator<T extends IActivatable>(type: { new(): T ;} ): T {
//     return new type();
// }
//
// export class AbstractClass {
//
// }
//
// @CustomDecorator("abstract")
// export class SubClass extends AbstractClass {
//         constructor() {
//             super();
//             console.log("Subclass instantiated");
//         }
//
// }