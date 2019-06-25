export interface ProtocolDocumentation {
    description?: string;
    homepage?: string;
    libraryHomepage?: string;
    schema?: ProtocolSchema;
}

export interface ProtocolSchema {
    attributes?: {
        [attributeName: string]: ProtocolAttribute;
    };
    hooks?: {
        [hookName: string]: ProtocolEventHook
    };
}

export interface ProtocolEventHook {
    description?: string;
    arguments?: {
        [argumentName: string]: {
            description?: string;
        }
    };
}

interface ProtocolAttributeObject {
    [attributeName: string]: ProtocolAttribute;
}

export interface ProtocolAttribute {
    type: 'string' | 'number' | 'text' | 'boolean' | ProtocolAttributeObject | 'object' | 'any' | 'int' | 'list';
    description?: string;
    required?: boolean;
    defaultValue?: any;
    suffix?: string;
    label?: string;
    example?: any;
    listValues?: any[];
}
