let colorizer: {
    black: {
        bgHex: (s: string) => Function;
        bgYellow: (s: string) => string;
        bgRed: (s: string) => string;
        bgGreen: (s: string) => string;
    };
    magenta: (s: string) => string;
    blue: (s: string) => string;
    cyan: (s: string) => string;
    green: (s: string) => string;
    red: (s: string) => string;
    yellow: (s: string) => string;
    hex: (s: string) => string;
    reset: (s: string) => string;
    gray: (s: string) => string;
};

try {
    colorizer = require('chalk');
} catch (e) {
    colorizer = {
        black: {
            bgHex: () => (message: string) => message,
            bgYellow: (message: string) => message,
            bgRed: (message: string) => message,
            bgGreen: (message: string) => message,
        },
        magenta: (message: string) => message,
        blue: (message: string) => message,
        cyan: (message: string) => message,
        green: (message: string) => message,
        red: (message: string) => message,
        yellow: (message: string) => message,
        hex: (message: string) => message,
        reset: (message: string) => message,
        gray: (message: string) => message,

    };
}
export default colorizer;
