const request = require("request");

export class PublishRest {
    endpoint: string = "";
    method: string = "";
    header: any = {};
    payload: string = "";

    publish(): boolean {
        request.post({
                url: this.endpoint,
                body: this.payload
            },
            (error: any, response: any, body: any) =>
            {
                if (error) {
                    console.log("Error to publish http: "  + error)
                }
            });

        return true;
    }

}
