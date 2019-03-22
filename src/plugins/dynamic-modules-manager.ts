import {MainInstance} from './main-instance';
import {ProtocolManager} from './protocol-manager';
import {ReportFormatterManager} from './report-formatter-manager';
import {Configuration} from '../configurations/configuration';
import {Logger} from '../loggers/logger';
import * as path from 'path';
import {ObjectParserManager} from './object-parser-manager';
import {AsserterManager} from './asserter-manager';
import * as os from 'os';
import * as glob from 'glob';
import * as fs from 'fs';

export class DynamicModulesManager {
    private static instance: DynamicModulesManager;
    private readonly protocolManager: ProtocolManager;
    private readonly reportFormatterManager: ReportFormatterManager;
    private readonly objectParserManager: ObjectParserManager;
    private readonly asserterManager: AsserterManager;
    private readonly builtInModules: string[];
    private readonly implicitModules: string[];

    private constructor() {
        this.protocolManager = new ProtocolManager();
        this.reportFormatterManager = new ReportFormatterManager();
        this.objectParserManager = new ObjectParserManager();
        this.asserterManager = new AsserterManager();
        this.builtInModules = this.findEveryEntryPointableModule();
        this.implicitModules = this.findEveryEnqueuerPluginPackage();
        this.loadModules();
    }

    public static getInstance() {
        if (!DynamicModulesManager.instance) {
            DynamicModulesManager.instance = new DynamicModulesManager();
        }
        return DynamicModulesManager.instance;
    }

    public getBuiltInModules(): string[] {
        return this.builtInModules;
    }

    public getImplicitModules(): string[] {
        return this.implicitModules;
    }

    public getProtocolManager(): ProtocolManager {
        return this.protocolManager;
    }

    public getAsserterManager(): AsserterManager {
        return this.asserterManager;
    }

    public getReportFormatterManager(): ReportFormatterManager {
        return this.reportFormatterManager;
    }

    public getObjectParserManager(): ObjectParserManager {
        return this.objectParserManager;
    }

    private findEveryEntryPointableModule(): string[] {
        const pattern = __dirname + '/../**/*\.+(ts|d.ts|js)';
        return glob.sync(pattern, {})
            .map(module => module.replace('./src/', '../'))
            .map(module => module.replace(/\.d\.ts/, ''))
            .map(module => module.replace(/\.ts/, ''))
            .map(module => module.replace(/\.js/, ''))
            .filter(module => {
                try {
                    return require(module).entryPoint !== undefined;
                } catch (err) {
                    return false;
                }
            });
    }

    private findEveryEnqueuerPluginPackage(): string[] {
        try {
            const pattern = os.homedir() + '/.nqr/node_modules/*';
            return (glob.sync(pattern, {}) || [])
                .map(module => module.replace(/\.js/, ''))
                .filter(module => {
                    try {
                        const packageJson = JSON.parse(fs.readFileSync(module + '/package.json').toString());
                        if (packageJson.keywords
                            .filter((keyword: string) => keyword === 'enqueuer' || keyword === 'nqr').length > 0) {
                            return require(module).entryPoint !== undefined;
                        }
                    } catch (err) {
                    }
                    return false;
                });
        } catch (err) {

        }
        return [];
    }

    private loadModules() {
        Logger.info(`Loading built in modules`);
        this.builtInModules
            .forEach(module => this.loadModule(module,
                () => Logger.debug(`Success to load '${path.basename(module)}' as built in module`),
                (err: any) => Logger.trace(`Fail to load '${module}' as built in  module: ${err}`)));
        Logger.info(`Loading ${this.implicitModules.length} implicitly declared plugins`);
        this.implicitModules
            .forEach(module => this.loadModule(module,
                () => Logger.info(`Success to load '${path.basename(module)}' as dynamic importable module`),
                (err: any) => Logger.error(`Fail to load '${module}' as dynamic importable module: ${err}`)));
        const explicitPlugins = Configuration.getInstance().getPlugins();
        Logger.info(`Loading ${explicitPlugins.length} explicitly declared plugins`);
        explicitPlugins
            .forEach(module => this.loadModule(module,
                () => Logger.info(`Success to load '${path.basename(module)}' as dynamic importable module`),
                (err: any) => Logger.error(`Fail to load '${module}' as dynamic importable module: ${err}`)));
    }

    private loadModule(module: string, onSucces: Function, onFail: Function) {
        try {
            require(module)
                .entryPoint(
                    {
                        protocolManager: this.protocolManager,
                        reportFormatterManager: this.reportFormatterManager,
                        objectParserManager: this.objectParserManager,
                        asserterManager: this.asserterManager
                    } as MainInstance
                );
            onSucces();
        } catch (err) {
            onFail(err);
        }

    }

}
