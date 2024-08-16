import {StoreCleaner} from './store-cleaner';
import {Store} from '../configurations/store';

describe('StoreCleaner', () => {
    it('should clean store when a message arrives', async () => {
        Store.getData().test = true;

        expect(Store.getData().test).toBeTruthy();
        await new StoreCleaner().process();

        expect(Store.getData().test).toBeUndefined();
    });
});
