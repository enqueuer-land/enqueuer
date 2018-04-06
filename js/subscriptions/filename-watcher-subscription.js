"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const subscription_1 = require("./subscription");
const logger_1 = require("../loggers/logger");
const injector_1 = require("../injector/injector");
const fs = require("fs");
const chokidar = require('chokidar');
let FileNameWatcherSubscription = class FileNameWatcherSubscription extends subscription_1.Subscription {
    constructor(subscriptionAttributes) {
        super(subscriptionAttributes);
        this.files = [];
        this.fileNamePattern = subscriptionAttributes.fileNamePattern;
        this.checkIntervalMs = subscriptionAttributes.checkIntervalMs;
        this.watcher = chokidar.watch(this.fileNamePattern, { ignored: /(^|[\/\\])\../ });
    }
    connect() {
        this.watcher.on('add', path => this.files.push(path));
        this.watcher.on('change', path => this.files.push(path));
        return Promise.resolve();
    }
    receiveMessage() {
        return new Promise((resolve, reject) => {
            this.popFileContent()
                .then(fileContent => resolve(fileContent))
                .catch(err => reject(err));
        });
    }
    popFileContent() {
        return new Promise((resolve, reject) => {
            var timer = setInterval(() => {
                const file = this.files.pop();
                if (file) {
                    logger_1.Logger.debug(`FileNameWatcher subscription detected file: ${file}`);
                    clearInterval(timer);
                    this.readFile(file)
                        .then(fileContent => resolve(fileContent))
                        .catch(err => reject(err));
                }
            }, this.checkIntervalMs);
        });
    }
    readFile(filename) {
        return new Promise((resolve, reject) => {
            fs.readFile(filename, (error, data) => {
                if (error)
                    reject(error);
                else {
                    resolve(data);
                }
            });
        });
    }
};
FileNameWatcherSubscription = __decorate([
    injector_1.Injectable((subscriptionAttributes) => subscriptionAttributes.type === "file-name-watcher"),
    __metadata("design:paramtypes", [Object])
], FileNameWatcherSubscription);
exports.FileNameWatcherSubscription = FileNameWatcherSubscription;
