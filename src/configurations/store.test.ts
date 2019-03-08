import {Store} from './store';
import {Configuration} from './configuration';

jest.mock('./configuration');

describe('Store', () => {

    beforeEach(() => {
        // @ts-ignore
        Store.data = undefined;
    });

    it('Catch getData exception', () => {
        // @ts-ignore
        Configuration.getInstance.mockImplementationOnce(() => {
            throw `err`;
        });

        expect(() => Store.getData()).not.toThrow();
    });

    it('should get data from configuration', () => {
        // @ts-ignore
        Configuration.getInstance.mockImplementationOnce(() => {
            return {
                getStore: () => {
                    return {
                        key: 'value'
                    };
                }
            };
        });

        expect(Store.getData().key).toBe('value');
    });

    it('should refresh data', () => {
        // @ts-ignore
        Configuration.getInstance.mockImplementationOnce(() => {
            return {
                getStore: () => {
                    return {};
                }
            };
        });

        Store.getData().key = 5;
        expect(Store.getData().key).toBe(5);

        Store.refreshData();

        expect(Store.getData().key).toBeUndefined();
    });

    it('data call just once', () => {
        const getValuesMock = jest.fn(() => {
            return {
                getStore: () => {
                    return {};
                }
            };
        });
        // @ts-ignore
        Configuration.getInstance.mockImplementationOnce(getValuesMock);

        Store.getData();
        Store.getData();
        Store.getData();

        expect(getValuesMock).toBeCalledTimes(1);
    });

    it('should get env var', () => {
        const getValuesMock = jest.fn(() => {
            return {
                getStore: () => {
                    return {};
                }
            };
        });
        // @ts-ignore
        Configuration.getInstance.mockImplementationOnce(getValuesMock);

        expect(Store.getData().PATH).toBeDefined();
    });

});
