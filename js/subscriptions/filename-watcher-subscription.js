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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const subscription_1 = require("./subscription");
const logger_1 = require("../loggers/logger");
const conditional_injector_1 = require("conditional-injector");
const fs = __importStar(require("fs"));
const glob = __importStar(require("glob"));
let FileSystemWatcherSubscription = class FileSystemWatcherSubscription extends subscription_1.Subscription {
    constructor(subscriptionAttributes) {
        super(subscriptionAttributes);
        this.options = subscriptionAttributes.options || { nodir: true };
        if (!this.fileNamePattern) {
            throw new Error(`Impossible to create a ${this.type} with no 'fileNamePattern' field`);
        }
    }
    subscribe() {
        return Promise.resolve();
    }
    receiveMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let interval = setInterval(() => {
                    const files = glob.sync(this.fileNamePattern, this.options);
                    if (files.length > 0) {
                        const filename = files[0];
                        try {
                            resolve(this.extractFileInformation(filename));
                        }
                        catch (error) {
                            logger_1.Logger.warning(`Error reading file ${filename}: ${error}`);
                            reject(error);
                        }
                        clearInterval(interval);
                    }
                }, 50);
            });
        });
    }
    extractFileInformation(filename) {
        const stat = fs.lstatSync(filename);
        const message = {
            content: fs.readFileSync(filename).toString(),
            name: filename,
            size: stat.size,
            modified: stat.mtime,
            created: stat.ctime
        };
        return message;
    }
};
FileSystemWatcherSubscription = __decorate([
    conditional_injector_1.Injectable({ predicate: (subscriptionAttributes) => subscriptionAttributes.type === 'file-system-watcher' }),
    __metadata("design:paramtypes", [Object])
], FileSystemWatcherSubscription);
exports.FileSystemWatcherSubscription = FileSystemWatcherSubscription;
