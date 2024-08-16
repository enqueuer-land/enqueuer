import {StoreSetter} from './store-setter';
import {Store} from '../configurations/store';

describe('StoreSetter', () => {
    it('should set store when a message arrives', async () => {
        expect(Store.getData().a).toBeUndefined();
        expect(Store.getData().b).toBeUndefined();

        await new StoreSetter().process({
            value: {
                a: true,
                b: 4
            }
        });

        expect(Store.getData().a).toBeTruthy();
        expect(Store.getData().b).toBe(4);
    });
});
