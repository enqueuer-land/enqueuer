import { MainInstance } from './main-instance';
import { ProtocolManager } from './protocol-manager';
import { ReportFormatterManager } from './report-formatter-manager';
import { Configuration } from '../configurations/configuration';
import { Logger } from '../loggers/logger';
import * as path from 'path';
import { ObjectParserManager } from './object-parser-manager';
import { AsserterManager } from './asserter-manager';
import * as os from 'os';
import * as glob from 'glob';
import * as fs from 'fs';
import { prettifyJson } from '../outputs/prettify-json';

const enqueuerPackageJson = require('../../package.json');

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
        this.implicitModules = this.findEveryEnqueuerImplicitPluginPackage(
            os.homedir() + '/.nqr/node_modules/*'
        ).concat(this.findEveryEnqueuerImplicitPluginPackage(__dirname + '/../../node_modules/*'));
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
        implicit: string[];
        explicit: string[];
    } {
        return {
            implicit: this.implicitModules,
            explicit: this.explicitModules
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
        console.log(prettifyJson(this.getLoadedModules()));
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

    public findEveryEnqueuerImplicitPluginPackage(pattern: string): string[] {
        try {
            return (glob.sync(pattern, {}) || [])
                .map(module => module.replace(/\.js/, ''))
                .filter(module => !module.includes('.test'))
                .filter(module => {
                    try {
                        const packageJsonPath = module + '/package.json';
                        if (fs.existsSync(packageJsonPath)) {
                            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());
                            const keyWordsMatch = (packageJson.keywords || []).find(
                                (keyword: string) =>
                                    keyword.toLowerCase() === 'enqueuer' || keyword.toLowerCase() === 'nqr'
                            );
                            if (keyWordsMatch) {
                                const versionMatches = DynamicModulesManager.versionMatches(packageJson);
                                if (versionMatches) {
                                    return require(module).entryPoint !== undefined;
                                }
                            }
                        }
                    } catch (err) {
                        Logger.trace(`Dynamic modules manager: ` + err);
                    }
                    return false;
                });
        } catch (err) {}
        return [];
    }

    private static versionMatches(packageJson: {
        name: string;
        dependencies: any;
        devDependencies: any;
        peerDependencies: any;
    }): boolean {
        const regexp = /[^\d]*(\d+)/;
        const currentMajorVersion = (process.env.npm_package_version || enqueuerPackageJson.version).match(regexp)[0];
        const enqueuerVersion =
            (packageJson.dependencies || {}).enqueuer ||
            (packageJson.devDependencies || {}).enqueuer ||
            (packageJson.peerDependencies || {}).enqueuer ||
            '0.0.0';
        const pluginMajorEnqueuerVersion = enqueuerVersion.match(regexp)[1];

        Logger.trace(
            `name: ${packageJson.name} => currentMajorVersion (${+currentMajorVersion}) <= pluginMajorEnqueuerVersion (${+pluginMajorEnqueuerVersion}): ${+currentMajorVersion <= +pluginMajorEnqueuerVersion}`
        );
        return +currentMajorVersion <= +pluginMajorEnqueuerVersion;
    }

    private loadModule(module: string): boolean {
        try {
            require(module).entryPoint({
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
        const pattern = __dirname + '/../**/*.+(ts|d.ts|js)';
        const files = glob
            .sync(pattern, {})
            .map(module => module.replace('./src/', '../'))
            .map(module => module.replace(/\.d\.ts/, ''))
            .map(module => module.replace(/\.ts/, ''))
            .map(module => module.replace(/\.js/, ''))
            .filter(module => !module.includes('.test'))
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

    private initialModulesLoad() {
        Logger.info(`Loading built in modules`);
        this.builtInModules.forEach(module =>
            this.loadModule(module)
                ? Logger.debug(`Success to load '${path.basename(module)}' as built in module`)
                : Logger.trace(`Fail to load '${module}' as built in  module`)
        );

        Logger.info(`Loading ${this.implicitModules.length} implicitly declared plugins`);
        this.implicitModules.forEach(module =>
            this.loadModule(module)
                ? Logger.info(`Success to load '${path.basename(module)}' as dynamic module`)
                : Logger.error(`Fail to load '${module}' as dynamic module`)
        );

        const configurationPlugins = Configuration.getInstance().getPlugins();
        Logger.info(`Loading ${configurationPlugins.length} explicitly declared plugins`);
        configurationPlugins
            .filter(module => !this.explicitModules.includes(module))
            .forEach(module => this.loadModuleExplicitly(module));
    }
}
