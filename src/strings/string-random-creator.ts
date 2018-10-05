export class StringRandomCreator {

    private possible: string;

    public constructor(possible: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
        this.possible = possible;
    }

    public create = (length: number): string => {
        let text = '';

        for (let i = length; i > 0; --i) {
            text += this.possible.charAt(Math.floor(Math.random() * this.possible.length));
        }

        return text;
    }

}