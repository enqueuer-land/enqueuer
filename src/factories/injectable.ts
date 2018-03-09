// module Injectable {
//     export const injectables: any = {};
//     export const Injectable = (type: string) => {
//
//
//         return function(target: any) {
//             var parentTarget = Object.getPrototypeOf(target.prototype).constructor.name;
//             if (!injectables[parentTarget])
//                 injectables[parentTarget] = [];
//             injectables[parentTarget][type] = target;
//             return target;
//         };
//     }
// }
