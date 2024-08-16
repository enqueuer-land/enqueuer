import {EventExecutor} from './event-executor';

let initializable: any;

describe('EventExecutor', () => {
    beforeEach(() => {
        initializable = {
            value: 4,
            onInit: {
                store: {
                    key: 'value'
                },
                script: 'this.method(this.value)',
                assertions: [
                    {
                        name: 'equalName',
                        expected: 2,
                        isEqualTo: 2
                    },
                    {
                        isDefined: 'x'
                    }
                ]
            }
        };
    });

    it('Should add argument and pass it to the script executor', (done) => {
        const eventExecutor: EventExecutor = new EventExecutor(initializable, 'onInit');
        initializable.method = (value: number) => {
            expect(value).toBe(initializable.value);
            done();
        };

        eventExecutor.execute();
    });

    it('Should return empty array if no event is passed', () => {
        const eventExecutor: EventExecutor = new EventExecutor(initializable, 'noInit');

        const testModels = eventExecutor.execute();

        expect(testModels.length).toBe(0);
    });
});
