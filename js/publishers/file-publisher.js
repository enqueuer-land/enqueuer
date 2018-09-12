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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var FilePublisher_1;
"use strict";
const publisher_1 = require("./publisher");
const id_generator_1 = require("../id-generator/id-generator");
const conditional_injector_1 = require("conditional-injector");
const yaml = __importStar(require("yamljs"));
const fs = __importStar(require("fs"));
const logger_1 = require("../loggers/logger");
let FilePublisher = FilePublisher_1 = class FilePublisher extends publisher_1.Publisher {
    constructor(publisherAttributes) {
        super(publisherAttributes);
        this.filename = publisherAttributes.filename;
        this.filenamePrefix = publisherAttributes.filenamePrefix;
        this.filenameExtension = publisherAttributes.filenameExtension || 'enq';
    }
    publish() {
        this.filename = this.createFilename();
        let value = this.payload;
        if (typeof (value) == 'string') {
            value = this.markupLanguageString(value);
        }
        else if (typeof (value) == 'object') {
            value = FilePublisher_1.decycle(this.payload);
            value = this.markupLanguageString(JSON.stringify(value));
        }
        fs.writeFileSync(this.filename, value);
        return Promise.resolve();
    }
    markupLanguageString(value) {
        try {
            value = JSON.parse(value);
        }
        catch (exc) {
            logger_1.Logger.debug('Content to write to file is not parseable');
            return value;
        }
        if (this.filename.endsWith('yml') || this.filename.endsWith('yaml')) {
            logger_1.Logger.debug('Stringifying file content as yaml');
            return yaml.stringify(value, 10, 2);
        }
        logger_1.Logger.debug('Stringifying file content as JSON');
        return JSON.stringify(value, null, 2);
    }
    createFilename() {
        let filename = this.filename;
        if (!filename) {
            filename = this.filenamePrefix;
            filename += this.generateId();
            if (filename.lastIndexOf('.') == -1) {
                filename += '.' + this.filenameExtension;
            }
        }
        return filename;
    }
    generateId() {
        try {
            const name = this.payload.name;
            const id = name.substr(name.lastIndexOf('/'));
            if (id) {
                return id;
            }
        }
        catch (exc) {
            //do nothing
        }
        return new id_generator_1.IdGenerator(this.payload).generateId();
    }
    static decycle(decyclable) {
        const cache = new Map();
        const stringified = JSON.stringify(decyclable, (key, value) => {
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
        return JSON.parse(stringified);
    }
};
FilePublisher = FilePublisher_1 = __decorate([
    conditional_injector_1.Injectable({ predicate: (publishRequisition) => publishRequisition.type === 'file' }),
    __metadata("design:paramtypes", [Object])
], FilePublisher);
exports.FilePublisher = FilePublisher;
