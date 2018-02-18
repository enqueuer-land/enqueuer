import { MqttRequisitionFile } from './mqtt-requisition-file';
import {plainToClass, deserialize} from "class-transformer";

export class MqttRequisitionFileParser {
    private static fs = require('fs');

    parse(filename: string): MqttRequisitionFile {
        try {
            const jsonData = MqttRequisitionFileParser.fs.readFileSync(filename);
            return deserialize(MqttRequisitionFile, jsonData);
        } catch (e) {
            throw new Error("Error parsing file: " + e);
        }
    }

}