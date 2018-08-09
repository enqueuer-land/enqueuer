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
}
Object.defineProperty(exports, "__esModule", { value: true });
const subscription_1 = require("./subscription");
const logger_1 = require("../loggers/logger");
const conditional_injector_1 = require("conditional-injector");
const fs = __importStar(require("fs"));
const chokidar = __importStar(require("chokidar"));
let FileNameWatcherSubscription = class FileNameWatcherSubscription extends subscription_1.Subscription {
    constructor(subscriptionAttributes) {
        super(subscriptionAttributes);
        this.filesName = [];
        this.fileNamePattern = subscriptionAttributes.fileNamePattern;
    }
    connect() {
        this.watcher = chokidar.watch(this.fileNamePattern, { ignored: /(^|[\/\\])\../ });
        return new Promise((resolve) => {
            this.watcher.on('add', (fileName) => {
                logger_1.Logger.trace(`${this.type} found file: ${fileName}`);
                this.filesName.push(fileName);
            });
            this.watcher.on('ready', () => {
                logger_1.Logger.trace(`${this.type} is ready`);
                resolve();
            });
        });
    }
    receiveMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.popFileContent();
        });
    }
    popFileContent() {
        return new Promise((resolve, reject) => {
            let interval = setInterval(() => {
                const pop = this.filesName.shift();
                if (pop) {
                    try {
                        const stat = fs.lstatSync(pop);
                        resolve({
                            content: fs.readFileSync(pop).toString(),
                            name: pop,
                            size: stat.size,
                            modified: stat.mtime,
                            created: stat.ctime
                        });
                    }
                    catch (error) {
                        logger_1.Logger.warning(`Error reading file ${JSON.stringify(error)}`);
                        reject(error);
                    }
                    clearInterval(interval);
                }
            }, 50);
        });
    }
};
FileNameWatcherSubscription = __decorate([
    conditional_injector_1.Injectable({ predicate: (subscriptionAttributes) => subscriptionAttributes.type === 'file-name-watcher' }),
    __metadata("design:paramtypes", [Object])
], FileNameWatcherSubscription);
exports.FileNameWatcherSubscription = FileNameWatcherSubscription;
