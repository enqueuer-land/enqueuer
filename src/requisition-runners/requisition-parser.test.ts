import {DynamicModulesManager} from '../plugins/dynamic-modules-manager';
import {YmlObjectParser} from '../object-parser/yml-object-parser';
import {RequisitionParser} from './requisition-parser';

describe('RequisitionParser', () => {
    beforeEach(() => {
        // @ts-ignore
        delete DynamicModulesManager.instance;
    });

    it('Should parse array as just one', () => {
        const requisitionsInput = [
            {
                onInit: {},
                id: 0
            },
            {
                publishers: [{type: true}],
                name: 'named',
                id: 1
            }
        ];
        DynamicModulesManager.getInstance()
            .getObjectParserManager()
            .addObjectParser(() => {
                return {
                    parse: () => requisitionsInput
                };
            }, 'yml');

        const fileContent = JSON.stringify(requisitionsInput);
        const requisition = new RequisitionParser().parse(fileContent);

        expect(requisition.requisitions[0].id).toBe(requisitionsInput[0].id);
        expect(requisition.requisitions[0].onInit).toEqual(requisitionsInput[0].onInit);

        expect(requisition.requisitions[1].name).toBe(requisitionsInput[1].name);
        expect(requisition.requisitions[1].id).toBe(requisitionsInput[1].id);
        expect(requisition.requisitions[1].publishers).toEqual(requisitionsInput[1].publishers);
    });

    it('Should throw', () => {
        expect(() => new RequisitionParser().parse('anyStuff')).toThrow();
    });

    it('Should add errors if file is not yml nor json', () => {
        const notYml = 'foo bar\nfoo: bar';

        DynamicModulesManager.getInstance()
            .getObjectParserManager()
            .addObjectParser(() => {
                return {
                    parse: (value) => new YmlObjectParser().parse(value)
                };
            }, 'yml');

        try {
            new RequisitionParser().parse('any:1\nany:1');
            expect(true).toBeFalsy();
        } catch (err) {
            expect(err.json).toBeDefined();
            expect(err.yml).toBeDefined();
        }
    });

    it('Should add error if it is not a valid requisition', () => {
        const notYml = 'hey: bar';

        DynamicModulesManager.getInstance()
            .getObjectParserManager()
            .addObjectParser(() => {
                return {
                    parse: (value) => new YmlObjectParser().parse(value)
                };
            }, 'yml');

        try {
            new RequisitionParser().parse(notYml);
            expect(true).toBeFalsy();
        } catch (err) {
            expect(err).toBe(
                `'hey: bar' is not a valid requisition.` +
                    ` Unable to find: 'onInit', 'onFinish', 'delay', 'requisitions', 'publishers', 'subscriptions' nor 'import'.`
            );
        }
    });
});
