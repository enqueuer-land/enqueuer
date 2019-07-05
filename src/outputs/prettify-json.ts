const configuration = {
    defaultIndentation: 4,
    inlineArrays: true,
    emptyArrayMsg: '-',
    keysColor: 'green',
    dashColor: 'grey'
};

export function prettifyJson(value: object): string {
    try {
        return require('prettyjson').render(value, configuration);
    } catch (e) {
        return JSON.stringify(value, null, configuration.defaultIndentation);
    }
}
