export class DateController {
  private date: Date;

  public constructor(date: Date = new Date()) {
    this.date = date || new Date();
  }

  public toString(): string {
    return this.date.toISOString();
  }

  private leftPad(number: number, targetLength: number): string {
    let output = number + '';
    while (output.length < targetLength) {
      output = '0' + output;
    }
    return output;
  }

  public getStringOnlyNumbers(): string {
    return (
      this.leftPad(this.date.getFullYear(), 4) +
      this.leftPad(this.date.getMonth() + 1, 2) +
      this.leftPad(this.date.getDate(), 2) +
      this.leftPad(this.date.getHours(), 2) +
      this.leftPad(this.date.getMinutes(), 2) +
      this.leftPad(this.date.getSeconds(), 2) +
      this.leftPad(this.date.getMilliseconds(), 4) +
      this.leftPad(Math.trunc(Math.random() * 100), 2)
    );
  }

  public getTime(): number {
    return this.date.getTime();
  }
}
