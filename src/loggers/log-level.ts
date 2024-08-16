import chalk from 'chalk';

export class LogLevel {
    private static priorityCounter: number = 0;

    public static readonly TRACE: LogLevel = new LogLevel(chalk.cyan);
    public static readonly DEBUG: LogLevel = new LogLevel(chalk.blue);
    public static readonly INFO: LogLevel = new LogLevel(chalk.green);
    public static readonly WARN: LogLevel = new LogLevel(chalk.yellow);
    public static readonly ERROR: LogLevel = new LogLevel(chalk.magenta);
    public static readonly FATAL: LogLevel = new LogLevel(chalk.red);

    private readonly priority: number;
    private readonly colorFunction: Function;

    constructor(colorFunction: Function) {
        this.priority = ++LogLevel.priorityCounter;
        this.colorFunction = colorFunction;
    }

    public static buildFromString(level: string): LogLevel {
        switch (level.toUpperCase()) {
            case 'TRACE':
                return LogLevel.TRACE;
            case 'DEBUG':
                return LogLevel.DEBUG;
            case 'INFO':
                return LogLevel.INFO;
            case 'WARN':
                return LogLevel.WARN;
            case 'ERROR':
                return LogLevel.ERROR;
            case 'FATAL':
                return LogLevel.FATAL;
            default:
                return LogLevel.WARN;
        }
    }

    public getPriority(): number {
        return this.priority;
    }

    public toString(): string {
        if (this.getPriority() === LogLevel.TRACE.getPriority()) {
            return 'TRACE';
        } else if (this.getPriority() === LogLevel.DEBUG.getPriority()) {
            return 'DEBUG';
        } else if (this.getPriority() === LogLevel.INFO.getPriority()) {
            return 'INFO';
        } else if (this.getPriority() === LogLevel.ERROR.getPriority()) {
            return 'ERROR';
        } else if (this.getPriority() === LogLevel.FATAL.getPriority()) {
            return 'FATAL';
        } //else if (this.getPriority() === LogLevel.WARN.getPriority()) {
        return 'WARN';

    }

    public getColorFunction(): Function {
        return this.colorFunction;
    }

    public hasPriorityLessThanOrEqualTo(other: LogLevel): boolean {
        return this.priority <= other.priority;
    }

}
