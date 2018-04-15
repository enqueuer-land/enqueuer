import {PlaceHolderReplacer} from "./place-holder-replacer";

describe('PlaceHolderReplacer', function() {

    it('should replace place holder', function() {
        const placeHolderReplacer = new PlaceHolderReplacer();

        const expected = 100;
        placeHolderReplacer.addVariableMap({
            key: expected
        });
        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: "{{key}}"
        })

        expect(afterReplace.replaceable).toBe(expected);
    });

    it('last added map should have higher priority', function() {
        const placeHolderReplacer = new PlaceHolderReplacer();

        const expected = "100";
        placeHolderReplacer.addVariableMap({
            key: "useless"
        });
        placeHolderReplacer.addVariableMap({
            key: expected
        });
        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: "{{key}}"
        })

        expect(afterReplace.replaceable).toBe(+expected);
    });

    it('last handle boolean values', function() {
        const placeHolderReplacer = new PlaceHolderReplacer();

        const expected = true;
        placeHolderReplacer.addVariableMap({
            key: "useless"
        });
        placeHolderReplacer.addVariableMap({
            key: expected
        });
        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: "{{key}}"
        })

        expect(afterReplace.replaceable).toBe(expected);
    });

    it('should not replace undefined placeHolder', function() {
        const placeHolderReplacer = new PlaceHolderReplacer();

        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: "{{key}}"
        })

        expect(afterReplace.replaceable).toBe("{{key}}");
    });

    it('should replace full object placeHolder', function() {
        const placeHolderReplacer = new PlaceHolderReplacer();

        placeHolderReplacer.addVariableMap({
            key: {
                nested: {
                    moreNested: {
                        key: "value"
                    }
                }
            }
        });

        const afterReplace: any = placeHolderReplacer.replace({
            replaceable: "{{key}}"
        })

        expect(afterReplace.replaceable.nested.moreNested.key).toBe("value");
    });

    it('should not replace key placeHolder', function() {
        const placeHolderReplacer = new PlaceHolderReplacer();

        placeHolderReplacer.addVariableMap({
            key: "someValue"
        });
        const afterReplace: any = placeHolderReplacer.replace({
            "{{key}}": "value"
        })

        expect(afterReplace.someValue).not.toBeDefined();
        expect(afterReplace["{{key}}"]).toBe("value");
    });

});