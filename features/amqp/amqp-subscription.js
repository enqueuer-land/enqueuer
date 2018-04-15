"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var subscription_1 = require("./subscription");
var injector_1 = require("../injector/injector");
var amqp = require('amqp');
var AmqpSubscription = /** @class */ (function (_super) {
    __extends(AmqpSubscription, _super);
    function AmqpSubscription(subscriptionAttributes) {
        var _this = _super.call(this, subscriptionAttributes) || this;
        _this.options = subscriptionAttributes.options;
        _this.queueName = subscriptionAttributes.queueName;
        return _this;
    }
    AmqpSubscription.prototype.receiveMessage = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.connection.queue(_this.queueName, function (queue) {
                queue.subscribe(function (message) {
                    resolve(message.data.toString());
                });
            });
        });
    };
    AmqpSubscription.prototype.connect = function () {
        var _this = this;
        this.connection = amqp.createConnection(this.options);
        return new Promise(function (resolve, reject) {
            _this.connection.on('ready', function () { return resolve(); });
            _this.connection.on('error', function (err) { return reject(err); });
        });
    };
    AmqpSubscription.prototype.unsubscribe = function () {
        if (this.connection) {
            this.connection.disconnect();
        }
        delete this.connection;
    };
    AmqpSubscription = __decorate([
        injector_1.Injectable(function (subscriptionAttributes) { return subscriptionAttributes.type === "amqp"; })
    ], AmqpSubscription);
    return AmqpSubscription;
}(subscription_1.Subscription));
exports.AmqpSubscription = AmqpSubscription;
