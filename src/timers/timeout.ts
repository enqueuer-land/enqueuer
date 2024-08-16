export class Timeout {
  private timeoutId?: ReturnType<typeof setTimeout>;
  private callback: Function;

  public constructor(callBack: Function) {
    this.callback = callBack;
  }

  public start(period: number) {
    this.timeoutId = global.setTimeout(() => {
      this.clear();
      this.callback();
    }, period);
  }

  public clear() {
    if (this.timeoutId) {
      global.clearTimeout(this.timeoutId);
      delete this.timeoutId;
    }
  }
}
