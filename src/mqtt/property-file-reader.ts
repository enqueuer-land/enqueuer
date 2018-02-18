export class PropertyFileReader {
    private fs = require('fs');
    private subscriptionTopics: string[] = [];

    constructor(propertyFileName: string) {
        try {
            const data = JSON.parse(this.fs.readFileSync(propertyFileName));
            this.subscriptionTopics = data.subscriptionTopics;
        } catch (e) {
            throw new Error("File not found: " + propertyFileName);
        }

    }

    getSubscriptionTopics(): string[] {
        return this.subscriptionTopics;
    }
}