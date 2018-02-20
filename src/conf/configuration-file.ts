const readYaml = require('read-yaml');

export class ConfigurationFile {
    private static singleton: ConfigurationFile = new ConfigurationFile();
    private configurations: any;

    private constructor() {
        this.configurations = readYaml.sync("conf/uds.yml");
    }

    private static getInstance(): ConfigurationFile {
        return this.singleton;
    }

    public static getConfigurations(): any {
        return JSON.parse(JSON.stringify(
            ConfigurationFile.getInstance().configurations));
    }

}