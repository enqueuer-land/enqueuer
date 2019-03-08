import {Configuration} from '../configurations/configuration';
import {Logger} from '../loggers/logger';
import {MainInstance} from './main-instance';
import {ProtocolManager} from './protocol-manager';
import {ReportFormatterManager} from './report-formatter-manager';

//TODO test it
export class PluginManager {
    private static instance: PluginManager;
    private readonly protocolManager: ProtocolManager;
    private readonly reportFormatterManager: ReportFormatterManager;

    private constructor() {
        this.protocolManager = new ProtocolManager();
        this.reportFormatterManager = new ReportFormatterManager();

        const builtInModules = [
            '../publishers/custom-publisher',
            '../publishers/file-publisher',
            '../publishers/http-publisher',
            '../publishers/standard-output-publisher',
            '../publishers/stream-publisher',
            '../publishers/udp-publisher',

            '../subscriptions/custom-subscription',
            '../subscriptions/filename-watcher-subscription',
            '../subscriptions/http-subscription',
            '../subscriptions/standard-input-subscription',
            '../subscriptions/stream-subscription',
            '../subscriptions/udp-subscription',

            '../outputs/formatters/console-formatter',
            '../outputs/formatters/json-formatter',
            '../outputs/formatters/yml-formatter'
        ];

        //sync forEach
        builtInModules.concat(Configuration.getInstance().getPlugins())
            .map(async module => {
                try {
                    require(module).entryPoint({
                        protocolManager: this.protocolManager,
                        reportFormatterManager: this.reportFormatterManager
                    } as MainInstance);
                } catch (err) {
                    Logger.warning(`Error loading '${module}': ${err}`);
                }
            });

    }

    public static getProtocolManager(): ProtocolManager {
        return PluginManager.getInstance().protocolManager;
    }

    public static getReportFormatterManager(): ReportFormatterManager {
        return PluginManager.getInstance().reportFormatterManager;
    }

    private static getInstance() {
        if (!PluginManager.instance) {
            PluginManager.instance = new PluginManager();
        }
        return PluginManager.instance;
    }
}
