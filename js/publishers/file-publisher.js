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
const injector_1 = require("../injector/injector");
const requisition_id_generator_1 = require("../requisitions/requisition-id-generator");
const fs = require("fs");
let FilePublisher = class FilePublisher extends publisher_1.Publisher {
    constructor(publisherAttributes) {
        super(publisherAttributes);
        this.filenamePrefix = publisherAttributes.filenamePrefix;
    }
    publish() {
        const filename = this.filenamePrefix + new requisition_id_generator_1.RequisitionIdGenerator(this.payload).generateId() + ".json";
        fs.writeFileSync(filename, JSON.stringify(JSON.parse(this.payload), null, 2));
        return Promise.resolve();
    }
};
FilePublisher = __decorate([
    injector_1.Injectable((publishRequisition) => publishRequisition.type === "file"),
    __metadata("design:paramtypes", [Object])
], FilePublisher);
exports.FilePublisher = FilePublisher;
