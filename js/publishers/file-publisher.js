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
const publisher_1 = require("./publisher");
const id_generator_1 = require("../timers/id-generator");
const conditional_injector_1 = require("conditional-injector");
const fs = __importStar(require("fs"));
const logger_1 = require("../loggers/logger");
const yaml_object_notation_1 = require("../object-notations/yaml-object-notation");
const javascript_object_notation_1 = require("../object-notations/javascript-object-notation");
const path = __importStar(require("path"));
let FilePublisher = class FilePublisher extends publisher_1.Publisher {
    constructor(publisherAttributes) {
        super(publisherAttributes);
        this.pretty = false;
        this.pretty = !!this.pretty;
        this.filenameExtension = this.filenameExtension || 'enq';
    }
    publish() {
        const filename = this.getFileName();
        let value = this.payload;
        if (typeof (value) === 'object') {
            value = new javascript_object_notation_1.JavascriptObjectNotation().stringify(value);
        }
        if (this.pretty) {
            value = this.markupLanguageString(value, filename);
        }
        fs.writeFileSync(filename, value);
        return Promise.resolve();
    }
    markupLanguageString(value, filename) {
        try {
            const parsed = new javascript_object_notation_1.JavascriptObjectNotation().parse(value);
            if (filename.endsWith('yml') || filename.endsWith('yaml')) {
                logger_1.Logger.debug(`Stringifying file content '${filename}' as YML`);
                return new yaml_object_notation_1.YamlObjectNotation().stringify(parsed);
            }
            logger_1.Logger.debug(`Stringifying file content '${filename}' as JSON`);
            return new javascript_object_notation_1.JavascriptObjectNotation().stringify(parsed);
        }
        catch (exc) {
            logger_1.Logger.debug('Content to write to file is not parseable');
            return value;
        }
    }
    getFileName() {
        if (this.filename) {
            return this.filename;
        }
        return this.createFileName();
    }
    createFileName() {
        let filename = this.filenamePrefix + this.generateId();
        const needsToInsertDot = filename.lastIndexOf('.') == -1 && this.filenameExtension.lastIndexOf('.') == -1;
        if (needsToInsertDot) {
            filename += '.';
        }
        return filename + this.filenameExtension;
    }
    generateId() {
        try {
            return path.parse(this.payload.name).name;
        }
        catch (exc) {
            return new id_generator_1.IdGenerator(this.payload).generateId();
        }
    }
};
FilePublisher = __decorate([
    conditional_injector_1.Injectable({ predicate: (publishRequisition) => publishRequisition.type === 'file' }),
    __metadata("design:paramtypes", [Object])
], FilePublisher);
exports.FilePublisher = FilePublisher;
