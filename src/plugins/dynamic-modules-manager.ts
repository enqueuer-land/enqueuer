import {MainInstance} from './main-instance';
import {ProtocolManager} from './protocol-manager';
import {ReportFormatterManager} from './report-formatter-manager';
import * as fs from 'fs';

export class DynamicModulesManager {
    private static instance: DynamicModulesManager;
    private readonly protocolManager: ProtocolManager;
    private readonly reportFormatterManager: ReportFormatterManager;
    private readonly builtInModules: string[];

    private constructor() {
        this.protocolManager = new ProtocolManager();
        this.reportFormatterManager = new ReportFormatterManager();
        this.builtInModules = this.findEveryEntryPointableModule();
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
            } else if (!filename.endsWith('.test.ts') && filename.endsWith('.ts')) {
                files.push(filename);
            }
        }
        return files;
    }

    private findEveryEntryPointableModule(): string[] {
        return DynamicModulesManager.findEveryTsFile('./src/')
            .map(module => module.replace('./src/', '../'))
            .map(module => module.replace(/\.ts$/, ''))
            .filter(module => {
                try {
                    require(module)
                        .entryPoint(
                            {
                                protocolManager: this.protocolManager,
                                reportFormatterManager: this.reportFormatterManager
                            } as MainInstance
                        );
                    return true;
                } catch (err) {
                    return false;
                }
            });

    }
}
