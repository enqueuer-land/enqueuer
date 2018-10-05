import {StringMatcher} from "./string-matcher";

describe('StringMatcher', () => {


    it('is a function', function () {
        expect(typeof new StringMatcher().sortBestMatches).toBe('function');
    });

    it('accepts a string and an array of strings and returns an object', function () {
        const output = new StringMatcher().sortBestMatches('one', ['two', 'three']);
        expect(typeof output).toBe('object');
    });

    it("throws a 'Bad arguments' error if no arguments passed", function () {
        expect(() => {
            new StringMatcher().sortBestMatches()
        }).toThrow();
    });

    it("throws a 'Bad arguments' error if first argument is not a non-empty string", function () {
        expect(() => {
            new StringMatcher().sortBestMatches('')
        }).toThrow();

        expect(() => {
            new StringMatcher().sortBestMatches(4)
        }).toThrow();
    });

    it('assigns a similarity rating to each string passed in the array', function () {
        const matches = new StringMatcher().sortBestMatches('healed', ['healed', 'mailed', 'edward', 'sealed', 'theatre']);

        expect(matches).toEqual([
            {"rating": 100, "target": "healed"},
            {"rating": 80, "target": "sealed"},
            {"rating": 40, "target": "mailed"},
            {"rating": 36, "target": "theatre"},
            {"rating": 20, "target": "edward"}]);
    });

    it("returns the best match and it's similarity rating", function () {
        const matches = new StringMatcher().sortBestMatches('healed', ['mailed', 'edward', 'sealed', 'theatre']);

        expect(matches[0]).toEqual({target: 'sealed', rating: 80});
    });

    it("both are empty", function () {
        const matches = new StringMatcher().sortBestMatches('', ['']);

        expect(matches[0].rating).toBe(100);
    });

    it("just first is empty", function () {
        const matches = new StringMatcher().sortBestMatches('', ['notEmpty']);

        expect(matches[0].rating).toBe(0);
    });

    it("just second is empty", function () {
        const matches = new StringMatcher().sortBestMatches('notEmpty', ['']);

        expect(matches[0].rating).toBe(0);
    });

    it("both one letter and different", function () {
        const matches = new StringMatcher().sortBestMatches('a', ['b']);

        expect(matches[0].rating).toBe(0);
    });

});