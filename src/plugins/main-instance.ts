import {ProtocolManager} from './protocol-manager';
import {ReportFormatterManager} from './report-formatter-manager';
import {ObjectParserManager} from './object-parser-manager';

export interface MainInstance {
    readonly protocolManager: ProtocolManager;
    readonly reportFormatterManager: ReportFormatterManager;
    readonly objectParserManager: ObjectParserManager;
}
