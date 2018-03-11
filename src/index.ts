#!/usr/bin/env node
import {Enqueuer} from "./enqueuer";
import {Configuration} from "./configurations/configuration";
import {RequisitionInput} from "./requisitions/requisition-input";
import {RequisitionOutput} from "./requisitions/requisition-output";


var requisitionInputs: RequisitionInput[] =
    Configuration.getInputs().map(input => new RequisitionInput(input));

var requisitionOutputs: RequisitionOutput[] =
    Configuration.getOutputs().map(output => new RequisitionOutput(output));

new Enqueuer(requisitionInputs, requisitionOutputs).execute();