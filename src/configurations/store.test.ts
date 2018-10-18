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

    it('Catch getData exception', () => {
        Configuration.getValues.mockImplementation(() => {
            throw `err`
        });

        const data = Store.getData();

        expect(data).toEqual({});
    });

    it('data call just once', () => {
        getValuesMock = jest.fn(() => {
            return {
                store: store
            }
        });
        Configuration.getValues.mockImplementationOnce(getValuesMock);
        Store.data = {};
        Store.getData();
        const data = Store.getData();

        expect(data.PATH).toBeDefined();
        expect(getValuesMock).toBeCalledTimes(1);
    });

});
