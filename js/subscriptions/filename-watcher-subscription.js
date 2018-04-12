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
        this.error = null;
        this.watchedFileContent = [];
        this.pushFileContent = (fileName) => {
            logger_1.Logger.info(`${this.type} found: ${fileName}`);
            fs.readFile(fileName, (error, data) => {
                if (error) {
                    this.error = error;
                    logger_1.Logger.warning(`Error reading file ${JSON.stringify(error)}`);
                }
                else {
                    this.watchedFileContent.push(data.toString());
                }
            });
        };
        this.fileNamePattern = subscriptionAttributes.fileNamePattern;
        this.checkIntervalMs = subscriptionAttributes.checkIntervalMs || 50;
    }
    connect() {
        const watcher = chokidar.watch(this.fileNamePattern, { ignored: /(^|[\/\\])\../ });
        watcher.on('add', (path) => this.pushFileContent(path));
        watcher.on('change', (path) => this.pushFileContent(path));
        return Promise.resolve();
    }
    receiveMessage() {
        return new Promise((resolve, reject) => {
            var timer = setInterval(() => {
                if (this.error)
                    return reject(this.error);
                if (this.watchedFileContent.length > 0) {
                    clearInterval(timer);
                    const content = this.watchedFileContent.pop();
                    if (content)
                        return resolve(content);
                    else {
                        return reject();
                    }
                }
            }, this.checkIntervalMs);
        });
    }
};
FileNameWatcherSubscription = __decorate([
    injector_1.Injectable((subscriptionAttributes) => subscriptionAttributes.type === "file-name-watcher"),
    __metadata("design:paramtypes", [Object])
], FileNameWatcherSubscription);
exports.FileNameWatcherSubscription = FileNameWatcherSubscription;
