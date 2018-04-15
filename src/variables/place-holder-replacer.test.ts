import {PlaceHolderReplacer} from "./place-holder-replacer";

describe('PlaceHolderReplacer', function() {

    it('should replace place holder', function() {
        const placeHolderReplacer = new PlaceHolderReplacer();

        const expected = 100;
        placeHolderReplacer.addVariableMap({
            key: expected
        });
        const afterReplace: any = placeHolderReplacer.replace({
            replaceble: "{{key}}"
        })

        expect(afterReplace.replaceble).toBe(expected + '');
    });

    it('last added map should have higher priority', function() {
        const placeHolderReplacer = new PlaceHolderReplacer();

        const expected = 100;
        placeHolderReplacer.addVariableMap({
            key: "useless"
        });
        placeHolderReplacer.addVariableMap({
            key: expected
        });
        const afterReplace: any = placeHolderReplacer.replace({
            replaceble: "{{key}}"
        })

        expect(afterReplace.replaceble).toBe(expected + '');
    });

    it('should not replace undefined placeHolder', function() {
        const placeHolderReplacer = new PlaceHolderReplacer();

        const afterReplace: any = placeHolderReplacer.replace({
            replaceble: "{{key}}"
        })

        expect(afterReplace.replaceble).toBe("{{key}}");
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