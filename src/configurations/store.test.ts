import {Store} from "./store";
import {Configuration} from "./configuration";

const store = {key: 'value'};

jest.mock('./configuration');
const getValuesMock = jest.fn(() => {
    return {
        store: store
    }
});
Configuration.getValues.mockImplementation(getValuesMock);

describe('Store', () => {

    it('no data getData', () => {
        const data = Store.getData();

        expect(data).toBe(store);
        expect(getValuesMock).toBeCalled();
    });

    it('data getData', () => {
        Store.getData();
        getValuesMock.mockClear();

        const data = Store.getData();

        expect(data).toBe(store);
        expect(getValuesMock).not.toBeCalled();
    });

});
