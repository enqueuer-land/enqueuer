import {Store} from "./store";
import {Configuration} from "./configuration";
jest.mock('./configuration');

const store = {key: 'value'};
let getValuesMock = jest.fn();

describe('Store', () => {
    let clearMocks = function () {
        getValuesMock.mockClear();
        Configuration.getValues.mockClear();
    };

    beforeEach(() => {
        clearMocks();
    });

    afterEach(() => {
        getValuesMock = jest.fn(() => {
            return {
                store: store
            }
        });
        Configuration.getValues.mockImplementationOnce(getValuesMock);
    });

    it('Catch getData exception', () => {
        Configuration.getValues.mockImplementation(() => {
            throw `err`
        });

        const data = Store.getData();

        expect(data).toEqual({});
    });

    it('data call just once', () => {
        Store.getData();
        const data = Store.getData();

        expect(data).toBe(store);
        expect(getValuesMock).toBeCalledTimes(1);
    });


});
