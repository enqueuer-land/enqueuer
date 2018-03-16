export class Timeout {

    timer?: NodeJS.Timer;
    private callback: Function;

    public constructor(callBack: Function) {
        this.callback = callBack;
    }


    public start(period: number) {
        this.timer = global.setTimeout(() => {
            this.clear();
            this.callback();
        }, period);
    }

    public clear() {
        if (this.timer) {
            global.clearTimeout(this.timer);
            delete this.timer;
        }
    }
}