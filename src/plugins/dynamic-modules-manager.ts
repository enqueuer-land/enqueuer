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
import prettyjson from 'prettyjson';
import {getPrettyJsonConfig} from '../outputs/prettyjson-config';

export class DynamicModulesManager {
    private static instance: DynamicModulesManager;
    private readonly protocolManager: ProtocolManager;
    private readonly reportFormatterManager: ReportFormatterManager;
    private readonly objectParserManager: ObjectParserManager;
    private readonly asserterManager: AsserterManager;
    private readonly builtInModules: string[];
    private readonly implicitModules: string[];
    private readonly explicitModules: string[];

    private constructor() {
        this.protocolManager = new ProtocolManager();
        this.reportFormatterManager = new ReportFormatterManager();
        this.objectParserManager = new ObjectParserManager();
        this.asserterManager = new AsserterManager();
        this.builtInModules = this.findEveryEntryPointableBuiltInModule();
        this.implicitModules = this.findEveryEnqueuerImplicitPluginPackage(os.homedir() + '/.nqr/node_modules/*')
            .concat(this.findEveryEnqueuerImplicitPluginPackage(__dirname + '/../../node_modules/*'));
        this.explicitModules = [];
        this.initialModulesLoad();
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

    public getLoadedModules(): {
        implicit: string[],
        explicit: string[]
    } {
        return {
            implicit: this.implicitModules,
            explicit: this.explicitModules,
        };
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

    public describeLoadedModules(): void {
        console.log(prettyjson.render(this.getLoadedModules(), getPrettyJsonConfig()));
    }

    public loadModuleExplicitly(module: string): boolean {
        if (this.loadModule(module)) {
            Logger.info(`Success to load '${path.basename(module)}' as dynamic module`);
            this.explicitModules.push(module);
            return true;
        } else {
            Logger.error(`Fail to load '${module}' as dynamic module`);
            return false;
        }
    }

    private loadModule(module: string): boolean {
        try {
            require(module)
                .entryPoint(
                    {
                        protocolManager: this.protocolManager,
                        reportFormatterManager: this.reportFormatterManager,
                        objectParserManager: this.objectParserManager,
                        asserterManager: this.asserterManager
                    } as MainInstance);
            return true;
        } catch (err) {
            Logger.error(`Fail to load '${module}': ${err}`);
        }
        return false;
    }

    private findEveryEntryPointableBuiltInModule(): string[] {
        const pattern = __dirname + '/../**/*\.+(ts|d.ts|js)';
        const files = glob.sync(pattern, {})
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
        const plugins: Set<string> = new Set(files);
        return Array.from(plugins.values());
    }

    private findEveryEnqueuerImplicitPluginPackage(pattern: string): string[] {
        try {
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

    private initialModulesLoad() {
        Logger.info(`Loading built in modules`);
        this.builtInModules
            .forEach(module => this.loadModule(module) ?
                Logger.debug(`Success to load '${path.basename(module)}' as built in module`) :
                Logger.trace(`Fail to load '${module}' as built in  module`));

        Logger.info(`Loading ${this.implicitModules.length} implicitly declared plugins`);
        this.implicitModules
            .forEach(module => this.loadModule(module) ?
                Logger.info(`Success to load '${path.basename(module)}' as dynamic module`) :
                Logger.error(`Fail to load '${module}' as dynamic module`));

        const configurationPlugins = Configuration.getInstance().getPlugins();
        Logger.info(`Loading ${configurationPlugins.length} explicitly declared plugins`);
        configurationPlugins
            .filter(module => !this.explicitModules.includes(module))
            .forEach(module => this.loadModuleExplicitly(module));
    }

}
