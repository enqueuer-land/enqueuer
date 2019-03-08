import {MainInstance} from './main-instance';
import {ProtocolManager} from './protocol-manager';
import {ReportFormatterManager} from './report-formatter-manager';
import * as fs from 'fs';
import {Logger} from '../loggers/logger';
import {Configuration} from '../configurations/configuration';
import * as path from 'path';

export class DynamicModulesManager {
    private static instance: DynamicModulesManager;
    private readonly protocolManager: ProtocolManager;
    private readonly reportFormatterManager: ReportFormatterManager;
    private readonly builtInModules: string[];

    private constructor() {
        this.protocolManager = new ProtocolManager();
        this.reportFormatterManager = new ReportFormatterManager();
        this.builtInModules = this.findEveryEntryPointableModule();
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

    public getProtocolManager(): ProtocolManager {
        return this.protocolManager;
    }

    public getReportFormatterManager(): ReportFormatterManager {
        return this.reportFormatterManager;
    }

    private static findEveryTsFile(path: string): string[] {
        let files: string[] = [];
        const dirContent = fs.readdirSync(path);
        for (let i = 0; i < dirContent.length; i++) {
            const filename = path + dirContent[i];
            const stat = fs.lstatSync(filename);
            if (stat.isDirectory()) {
                files = files.concat(DynamicModulesManager.findEveryTsFile(filename + '/'));
            } else if (!filename.endsWith('.test.ts')
                && (filename.endsWith('.d.ts') || filename.endsWith('.ts'))) {

                files.push(filename);
            }
        }
        return files;
    }

    private findEveryEntryPointableModule(): string[] {
        return DynamicModulesManager.findEveryTsFile(__dirname + '/../')
            .map(module => module.replace('./src/', '../'))
            .map(module => module.replace(/\.d\.ts/, ''))
            .map(module => module.replace(/\.ts/, ''))
            .filter(module => {
                try {
                    return require(module).entryPoint !== undefined;
                } catch (err) {
                    return false;
                }
            });

    }

    private loadModules() {
        this.builtInModules
            .filter(module => {
                try {
                    this.loadModule(module);
                    Logger.debug(`Success to load '${path.basename(module)}' as dynamic importable module`);
                    return true;
                } catch (err) {
                    Logger.trace(`Fail to load '${module}' as dynamic importable module: ${err}`);
                    return false;
                }
            });
        Configuration.getInstance().getPlugins()
            .filter(module => {
                try {
                    this.loadModule(module);
                    Logger.info(`Success to load '${path.basename(module)}' as dynamic importable module`);
                    return true;
                } catch (err) {
                    Logger.error(`Fail to load '${module}' as dynamic importable module: ${err}`);
                    return false;
                }
            });

    }

    private loadModule(module: string) {
        require(module)
            .entryPoint(
                {
                    protocolManager: this.protocolManager,
                    reportFormatterManager: this.reportFormatterManager
                } as MainInstance
            );
    }
}
