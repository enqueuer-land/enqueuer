export class PlaceHolderReplacer {
    private variablesMap: {}[] = [];

    public addVariableMap(variableMap: object): PlaceHolderReplacer {
        this.variablesMap.unshift(variableMap);
        return this;
    }

    public replace(json: {}): {} {
        return this.replaceChildren(json);
    }

    private replaceChildren = (node: any): {} => {
        for (const key in node) {
            const attribute = node[key];
            if (typeof attribute == 'object') {
                node[key] = this.replaceChildren(attribute);
            }
            else {
                node[key] = this.replaceValue(attribute.toString());
            }
        }
        return node;
    }

    public replaceValue(node: string): string {
        const output = node.replace(/{{\w+}}/g,
            (placeHolder: string): string => {
                            const key: string = placeHolder.substr(2, placeHolder.length - 4);
                            return this.checkInEveryMap(key) || placeHolder;
                    });

        try {
            return JSON.parse(output);
        }
        catch (exc) {
            return output;
        }
    }

    private checkInEveryMap(key: string): string | null {
        let map: any = {};
        for (map of this.variablesMap) {
            const variableValue: any = map[key];

            if (variableValue) {
                if (typeof variableValue == 'object') {
                    return JSON.stringify(variableValue);
                }
                return variableValue;
            }
        }
        return null;
    }
}