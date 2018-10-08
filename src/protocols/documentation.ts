export class Documentation {
    public optional?: boolean;
    public description?: string;
    public example?: string;
    public defaultValue?: string | number | boolean;
    public reference?: string;

    [propName: string]: any;

    public setOptional(optional: boolean): Documentation {
        this.optional = optional;
        return this;
    }

    public setDescription(description: string): Documentation {
        this.description = description;
        return this;
    }

    public setExample(example: string): Documentation {
        this.example = example;
        return this;
    }

    public setDefaultValue(defaultValue: string | number | boolean): Documentation {
        this.defaultValue = defaultValue;
        return this;
    }

    public setReference(reference: string): Documentation {
        this.reference = reference;
        return this;
    }

    public addChild(childName: string, child: Documentation): Documentation {
        this[childName] = child;
        return this;
    }
}