import { Publish } from "../service/requisition/requisition";

export class PublishPrePublishingExecutor {

    constructor(publish: Publish, message: any) {
        let prePublishFunction = publish.createPrePublishingFunction();
        if (prePublishFunction == null)
            return;
        
        const functionResponse = prePublishFunction(message);
    }
}