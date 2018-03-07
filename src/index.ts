import {Enqueuer} from "./enqueuer";
import {Configuration} from "./configurations/configuration";

new Enqueuer().execute(Configuration.getReaders());


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