import {ProtocolManager} from './protocol-manager';
import {ReportFormatterManager} from './report-formatter-manager';

export interface MainInstance {
    readonly protocolManager: ProtocolManager;
    readonly reportFormatterManager: ReportFormatterManager;
}
