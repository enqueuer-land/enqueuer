"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RequisitionMultiplier {
    constructor(requisition) {
        this.requisition = requisition;
    }
    multiply() {
        const iterations = this.requisition.iterations;
        if (this.requisition.iterations === undefined) {
            return [this.requisition];
        }
        let requisitions = [];
        for (let x = iterations || 0; x > 0; --x) {
            const clone = Object.assign({}, this.requisition);
            clone.name = clone.name + ` [${x}]`;
            requisitions = requisitions.concat(clone);
        }
        return requisitions;
    }
}
exports.RequisitionMultiplier = RequisitionMultiplier;
