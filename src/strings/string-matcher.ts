export type Match = {
    target: string,
    rating: number
};

export class StringMatcher {

    public sortBestMatches(mainString: string, targetStrings: string[]): Match[] {
        const ratings = targetStrings.map(target => ({target, rating: this.compareTwoStrings(mainString, target)}));
        return Array.from(ratings).sort((a, b) => b.rating - a.rating);
    }

    private compareTwoStrings(first: string, second: string): number {
        if (this.checkPrematureSuccess(first, second)) {
            return 100;
        } else if (this.checkPrematureFailure(first, second)) {
            return 0;
        } else {
            return this.doTheMath(first, second);
        }
    }

    private checkPrematureSuccess(first: string, second: string): boolean {
        const bothAreEmpty = first.length == 0 && second.length == 0;
        const bothAreInsensitiveEqual = first.toUpperCase() === second.toUpperCase();
        return bothAreEmpty || bothAreInsensitiveEqual;
    }

    private checkPrematureFailure(first: string, second: string): boolean {
        const justFirstIsEmpty = first.length == 0 && second.length > 0;
        const justSecondIsEmpty = first.length > 0 && second.length == 0;
        const justOneIsEmpty = justFirstIsEmpty || justSecondIsEmpty;
        const sizeOneAndNotEqual = first.length === 1 && second.length === 1 && first.toUpperCase() != second.toUpperCase();
        return justOneIsEmpty || sizeOneAndNotEqual;
    }

    private doTheMath(first: string, second: string) {
        const pairs1 = this.wordLetterPairs(first);
        const pairs2 = this.wordLetterPairs(second);
        const union = pairs1.length + pairs2.length;
        let intersection = 0;
        pairs1.forEach((pair1: any) => {
            for (let i = 0, pair2; pair2 = pairs2[i]; i++) {
                if (pair1 === pair2) {
                    intersection++;
                    pairs2.splice(i, 1);
                    break;
                }
            }
        });
        const floatRating = intersection * 2 / union;
        return Math.trunc(100 * floatRating);
    }

    private flattenDeep(arr: any): any {
        if (Array.isArray(arr)) {
            return arr.reduce((a, b) => a.concat(this.flattenDeep(b)), []);
        }
        return [arr];
    }

    private letterPairs(str: string) {
        const pairs = [];
        for (let i = 0, max = str.length - 1; i < max; i++) {
            pairs[i] = str.substring(i, i + 2);
        }
        return pairs;
    }

    private wordLetterPairs(str: string) {
        const pairs = str.toUpperCase()
            .split(' ')
            .map((str) => this.letterPairs(str));
        return this.flattenDeep(pairs);
    }
}