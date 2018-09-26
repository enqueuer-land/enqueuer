const packageJson = require('../../package.json');

export class DependencyManager {

    public listAvailable(): string[] {
        const dependencies = packageJson.optionalDependencies;
        return Object.keys(dependencies).map(key => `${key}@${dependencies[key]}`);
    }

}