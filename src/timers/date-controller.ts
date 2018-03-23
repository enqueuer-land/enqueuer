export class DateController {

    private date: Date;

    public constructor(date: Date = new Date()) {
        this.date = date || new Date();
    }

    public toString(): string {
        return this.date.toISOString();
    }

    public getStringOnlyNumbers(): string {
        return  this.date.getFullYear() +
                ("0"+(this.date.getMonth()+1)).slice(-2) +
                ("0" + this.date.getDate()).slice(-2)+
                ("0" + this.date.getHours()).slice(-2) +
                ("0" + this.date.getMinutes()).slice(-2) +
                ("0" + this.date.getSeconds()).slice(-2) +
                ("0" + this.date.getMilliseconds()).slice(-6);
    }

    public getTime(): number {
        return this.date.getTime();
    }
}