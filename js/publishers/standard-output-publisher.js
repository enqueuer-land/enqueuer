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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const publisher_1 = require("./publisher");
const conditional_injector_1 = require("conditional-injector");
const prettyjson_1 = __importDefault(require("prettyjson"));
const logger_1 = require("../loggers/logger");
const options = {
    defaultIndentation: 4,
    keysColor: 'white',
    dashColor: 'grey'
};
let StandardOutputPublisher = class StandardOutputPublisher extends publisher_1.Publisher {
    constructor(publisherProperties) {
        super(publisherProperties);
        this.pretty = !!publisherProperties.pretty;
    }
    publish() {
        logger_1.Logger.trace(`StandardOutputPublisher prettyfy: ${this.pretty}`);
        if (typeof (this.payload) === 'object') {
            this.payload = this.stringify(this.payload);
        }
        if (!this.pretty) {
            console.log(this.payload);
        }
        else {
            console.log(this.prettyfy());
        }
        return Promise.resolve();
    }
    prettyfy() {
        try {
            const parsed = JSON.parse(this.payload);
            return prettyjson_1.default.render(parsed, options);
        }
        catch (err) {
            logger_1.Logger.debug(`${this.type} can not prettyfy string`);
            return this.payload;
        }
    }
    stringify(payload) {
        const cache = new Map();
        const stringified = JSON.stringify(payload, (key, value) => {
            if (typeof (value) === 'object' && value !== null) {
                if (cache.has(value)) {
                    // Circular reference found, discard key
                    return;
                }
                // Store value in our map
                cache.set(value, true);
            }
            return value;
        });
        return stringified;
    }
};
StandardOutputPublisher = __decorate([
    conditional_injector_1.Injectable({ predicate: (publishRequisition) => publishRequisition.type === 'standard-output' }),
    __metadata("design:paramtypes", [Object])
], StandardOutputPublisher);
exports.StandardOutputPublisher = StandardOutputPublisher;
