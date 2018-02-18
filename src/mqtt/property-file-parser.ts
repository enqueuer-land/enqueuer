import { PropertyFile } from './property-file';
import {plainToClass, deserialize} from "class-transformer";

export class PropertyFileParser {
    private static fs = require('fs');

    parse(filename: string): PropertyFile {
        try {
            const jsonData = PropertyFileParser.fs.readFileSync(filename);
            return deserialize(PropertyFile, jsonData);
        } catch (e) {
            throw new Error("Error parsing file: " + e);
        }
    }

}