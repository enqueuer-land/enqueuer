// import {EventCallback} from "../event-callback";
// import {Type} from "class-transformer";
//
// import {Subscription} from "./subscription";
//
// export class Subscriptions {
//
//     @Type(() => Subscription)
//     subscription: Subscription[] = [];
//
//     public unsubscribe(): void {
//         this.subscription.forEach(subscription => subscription.unsubscribe())
//     }
//
//     public subscribe(callback: EventCallback): boolean {
//         this.subscription.forEach(subscription => subscription.subscribe(callback));
//         return true;
//     }
// }