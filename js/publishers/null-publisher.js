"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const publisher_1 = require("./publisher");
const conditional_injector_1 = require("conditional-injector");
let NullPublisher = class NullPublisher extends publisher_1.Publisher {
    publish() {
        return Promise.reject(`Undefined publishing type to publish event: ${this.type}`);
    }
};
NullPublisher = __decorate([
    conditional_injector_1.Injectable()
], NullPublisher);
exports.NullPublisher = NullPublisher;
