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
}
Object.defineProperty(exports, "__esModule", { value: true });
const publisher_1 = require("./publisher");
const id_generator_1 = require("../id-generator/id-generator");
const conditional_injector_1 = require("conditional-injector");
const util_1 = require("util");
const fs = __importStar(require("fs"));
let FilePublisher = class FilePublisher extends publisher_1.Publisher {
    constructor(publisherAttributes) {
        super(publisherAttributes);
        this.filename = publisherAttributes.filename;
        this.filenamePrefix = publisherAttributes.filenamePrefix;
        this.filenameExtension = publisherAttributes.filenameExtension || '.enqRun';
    }
    publish() {
        let filename = this.createFilename();
        let value = this.payload;
        try {
            value = JSON.stringify(JSON.parse(this.payload), null, 2);
        }
        catch (exc) {
            //do nothing
        }
        fs.writeFileSync(filename, value);
        return Promise.resolve();
    }
    createFilename() {
        let filename = this.filename;
        if (!filename) {
            filename = this.filenamePrefix;
            filename += this.generateId();
            filename += '.' + this.filenameExtension;
        }
        return filename;
    }
    generateId() {
        try {
            const id = JSON.parse(this.payload).id;
            if (!util_1.isNullOrUndefined(id)) {
                return id;
            }
        }
        catch (exc) {
            //do nothing
        }
        return new id_generator_1.IdGenerator(this.payload).generateId() + '.';
    }
};
FilePublisher = __decorate([
    conditional_injector_1.Injectable({ predicate: (publishRequisition) => publishRequisition.type === 'file' }),
    __metadata("design:paramtypes", [Object])
], FilePublisher);
exports.FilePublisher = FilePublisher;
