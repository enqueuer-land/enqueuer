import {Container, injectableContainer} from "./container";

describe('Container', function() {
    it('should return a copy from the original', () => {
        injectableContainer.field = "value";

        Container().field = "wrongValue";

        expect(Container().field).toBe("value");
    });

});