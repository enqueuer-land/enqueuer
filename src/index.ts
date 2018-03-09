import {Enqueuer} from "./enqueuer";
import {Configuration} from "./configurations/configuration";
import {RequisitionInput} from "./requisitions/requisition-input";
import {RequisitionOutput} from "./requisitions/requisition-output";


var requisitionInputs: RequisitionInput[] =
    Configuration.getInputs().map(input => new RequisitionInput(input));

var requisitionOutputs: RequisitionOutput[] =
    Configuration.getOutputs().map(output => new RequisitionOutput(output));

new Enqueuer(requisitionInputs, requisitionOutputs).execute();

// const Container: any = {};
//
// const Injectable = (type: string) => {
//     return function(target: any) {
//         // save a reference to the original constructor
//         // var original = target;
//
//         var parentTarget = Object.getPrototypeOf(target.prototype).constructor.name;
//         if (!Container[parentTarget])
//             Container[parentTarget] = [];
//         Container[parentTarget][type] = target;
//         // console.log("Sub: " + target.prototype.constructor.name)
//
//         // the new constructor behaviour
//         // var f: any = function (...args: any[]) {
//         //     console.log('Injectable: before class constructor', original.name);
//         //     let instance = original.apply(this, args)
//         //     console.log('Injectable: after class constructor', original.name);
//         //     return instance;
//         // }
//         //
//         // // copy prototype so intanceof operator still works
//         // f.prototype = original.prototype;
//
//         // return new constructor (will override original)
//         return target;
//     };
// }
//
// export class AbstractClass {
//
// }
//
// @Injectable("type")
// export class ClassExample extends AbstractClass{
//     public constructor() {
//         super();
//         console.info('Running ClassExample constructor...');
//     }
// }
//
// @Injectable("other")
// export class OtherExample extends AbstractClass{
//     public constructor() {
//         super();
//         console.info('Running OtherExample constructor...');
//     }
// }
//
// // let example = new ClassExample();
// // console.log(Container)
// new Container.AbstractClass["othercxzczx"]()