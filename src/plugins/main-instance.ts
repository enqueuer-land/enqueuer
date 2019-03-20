import {ProtocolManager} from './protocol-manager';
import {ReportFormatterManager} from './report-formatter-manager';
import {ObjectParserManager} from './object-parser-manager';
import {AsserterManager} from './asserter-manager';

export interface MainInstance {
    readonly protocolManager: ProtocolManager;
    readonly reportFormatterManager: ReportFormatterManager;
    readonly objectParserManager: ObjectParserManager;
    readonly asserterManager: AsserterManager;
}
