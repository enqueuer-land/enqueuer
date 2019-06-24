import {Protocol, ProtocolType} from './protocol';
import {ProtocolDocumentation} from './protocol-documentation';

describe('Protocol', () => {

    it('getName', () => {
        const name = 'gui';
        const match = new Protocol(name, undefined).getName();
        expect(match).toBe(name);
    });

    it('namesMatchExactly name', () => {
        const match = new Protocol('gui', undefined).matches('gui');
        expect(match).toBeTruthy();
    });

    it('should ignore case going', () => {
        const match = new Protocol('gui', undefined).matches('GUI');
        expect(match).toBeTruthy();
    });

    it('should ignore case coming', () => {
        const match = new Protocol('GUI', undefined).matches('gui');
        expect(match).toBeTruthy();
    });

    it('namesMatch alternative', () => {
        const match = new Protocol('', undefined, ).addAlternativeName('gui').matches('gui');
        expect(match).toBeTruthy();
    });

    it('names dont Match alternative', () => {
        const match = new Protocol('', undefined, ).addAlternativeName('one', 'two').matches('gui', 0);
        expect(match).toBeFalsy();
    });

    it('alternative names are unique', () => {
        const match = new Protocol('one', undefined).addAlternativeName('one', 'two').addAlternativeName('two', 'three');
        // @ts-ignore
        expect(match.alternativeNames).toEqual(['one', 'two', 'three']);
    });

    it('isLibraryInstalled', () => {
        // @ts-ignore
        const available = new Protocol('', undefined).setLibrary('express').library.installed;
        expect(available).toBeTruthy();
    });

    it('isLibraryInstalled false', () => {
        const available = new Protocol('', undefined).setLibrary('zero-mq-not-defined-at-least-I-hope').isLibraryInstalled();
        expect(available).toBeFalsy();
    });

    it('get deep property', () => {
        const doc: ProtocolDocumentation = {
            homepage: 'homepage',
            description: 'description',
            libraryHomepage: 'libraryHomepage',
            schema: {
                attributes: {
                    attributeName: {
                        description: 'AttributeDescription',
                        type: 'string'
                    }
                },
                hooks: {
                    onEvent: {
                        arguments: {'hookArg': {}}
                    }
                }
            }
        };
        // @ts-ignore
        const property = new Protocol('protocol', ProtocolType.SUBSCRIPTION, doc)
            .addAlternativeName('alternativeName')
            .setLibrary('express')
            .getDescription();
        expect(property).toEqual({
            'description': 'description', 'homepage': 'homepage', 'libraryHomepage': 'libraryHomepage', 'name': 'protocol', 'schema': {
                'attributes': {
                    'attributeName': {'description': 'AttributeDescription', 'type': 'string'},
                    'avoid': {
                        'defaultValue': false,
                        'description': 'Defines if the subscription should be avoided',
                        'required': false,
                        'type': 'boolean'
                    },
                    'ignore': {
                        'defaultValue': false,
                        'description': 'Defines if the component should be ignored',
                        'required': false,
                        'type': 'boolean'
                    },
                    'name': {'description': 'Defines the component name', 'required': false, 'type': 'string'},
                    'timeout': {
                        'defaultValue': 3000,
                        'description': 'Defines the subscription time out',
                        'required': false,
                        'suffix': 'ms',
                        'type': 'int'
                    }
                },
                'hooks': {
                    'onEvent': {
                        'arguments': {
                            'hookArg': {},
                            'elapsedTime': {
                                'description': 'Number of milliseconds since the instantiation of the component'
                            },
                            'this': {
                                'description': 'Pointer to the component'
                            }
                        }
                    },
                    'onFinish': {
                        'arguments': {
                            'elapsedTime': {'description': 'Number of milliseconds since the instantiation of the component'},
                            'this': {'description': 'Pointer to the component'}
                        }, 'description': 'Executed when the component is about to finish'
                    },
                    'onInit': {
                        'arguments': {
                            'elapsedTime': {'description': 'Number of milliseconds since the instantiation of the component'},
                            'this': {'description': 'Pointer to the component'}
                        }, 'description': 'Executed as soon as the component is initialized'
                    }
                }
            }
        });
    });

    it('get deep with nothing', () => {
        // @ts-ignore
        const property = new Protocol('protocol', ProtocolType.SUBSCRIPTION, {})
            .addAlternativeName('alternativeName')
            .setLibrary('express')
            .getDescription();
        expect(property).toEqual({
            'name': 'protocol', 'schema': {
                'attributes': {
                    'avoid': {
                        'defaultValue': false,
                        'description': 'Defines if the subscription should be avoided',
                        'required': false,
                        'type': 'boolean'
                    },
                    'ignore': {
                        'defaultValue': false,
                        'description': 'Defines if the component should be ignored',
                        'required': false,
                        'type': 'boolean'
                    },
                    'name': {'description': 'Defines the component name', 'required': false, 'type': 'string'},
                    'timeout': {
                        'defaultValue': 3000,
                        'description': 'Defines the subscription time out',
                        'required': false,
                        'suffix': 'ms',
                        'type': 'int'
                    }
                },
                'hooks': {
                    'onFinish': {
                        'arguments': {
                            'elapsedTime': {'description': 'Number of milliseconds since the instantiation of the component'},
                            'this': {'description': 'Pointer to the component'}
                        }, 'description': 'Executed when the component is about to finish'
                    },
                    'onInit': {
                        'arguments': {
                            'elapsedTime': {'description': 'Number of milliseconds since the instantiation of the component'},
                            'this': {'description': 'Pointer to the component'}
                        }, 'description': 'Executed as soon as the component is initialized'
                    }
                }
            }
        });
    });

});
