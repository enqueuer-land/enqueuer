export class DateController {

    private date: Date;

    public constructor() {
        this.date = new Date();
    }

    public toString(): string {
        // return ("0" + this.date.getDate()).slice(-2) + "-" +
        //         ("0"+(this.date.getMonth()+1)).slice(-2) + "-" +
        //         this.date.getFullYear() + " " +
        //         ("0" + this.date.getHours()).slice(-2) + ":" +
        //         ("0" + this.date.getMinutes()).slice(-2) + ":" +
        //         ("0" + this.date.getSeconds()).slice(-2) + "." +
        //         ("0" + this.date.getMilliseconds()).slice(-4);
        // return `${this.date.toString()}.${this.date.getMilliseconds()}`;
        return this.date.toISOString();
    }

    public getTime(): number {
        return this.date.getTime();
    }
}