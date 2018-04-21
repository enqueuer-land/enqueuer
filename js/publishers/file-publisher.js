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
const publisher_1 = require("./publisher");
const requisition_id_generator_1 = require("../requisitions/requisition-id-generator");
const conditional_injector_1 = require("conditional-injector");
const fs = require("fs");
let FilePublisher = class FilePublisher extends publisher_1.Publisher {
    constructor(publisherAttributes) {
        super(publisherAttributes);
        this.filenamePrefix = publisherAttributes.filenamePrefix;
        this.filenameExtension = publisherAttributes.filenameExtension;
    }
    publish() {
        const filename = this.filenamePrefix +
            new requisition_id_generator_1.RequisitionIdGenerator(this.payload).generateId() +
            "." +
            this.filenameExtension;
        let value = this.payload;
        try {
            value = JSON.stringify(JSON.parse(this.payload), null, 2);
        }
        catch (exc) { }
        fs.writeFileSync(filename, value);
        return Promise.resolve();
    }
};
FilePublisher = __decorate([
    conditional_injector_1.Injectable({ predicate: (publishRequisition) => publishRequisition.type === "file" }),
    __metadata("design:paramtypes", [Object])
], FilePublisher);
exports.FilePublisher = FilePublisher;
