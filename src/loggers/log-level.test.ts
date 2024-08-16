import { LogLevel } from './log-level';

describe('LogLevel', () => {
  it('should have correct priorities', () => {
    expect(LogLevel.TRACE.hasPriorityLessThanOrEqualTo(LogLevel.DEBUG)).toBeTruthy();
    expect(LogLevel.DEBUG.hasPriorityLessThanOrEqualTo(LogLevel.INFO)).toBeTruthy();
    expect(LogLevel.INFO.hasPriorityLessThanOrEqualTo(LogLevel.WARN)).toBeTruthy();
    expect(LogLevel.WARN.hasPriorityLessThanOrEqualTo(LogLevel.ERROR)).toBeTruthy();
    expect(LogLevel.ERROR.hasPriorityLessThanOrEqualTo(LogLevel.FATAL)).toBeTruthy();
  });

  it('should match var name', () => {
    expect(LogLevel.TRACE.toString()).toBe('TRACE');
    expect(LogLevel.DEBUG.toString()).toBe('DEBUG');
    expect(LogLevel.INFO.toString()).toBe('INFO');
    expect(LogLevel.WARN.toString()).toBe('WARN');
    expect(LogLevel.ERROR.toString()).toBe('ERROR');
    expect(LogLevel.FATAL.toString()).toBe('FATAL');
  });

  it('should build from string', () => {
    expect(LogLevel.buildFromString('TRACE').getPriority()).toBe(LogLevel.TRACE.getPriority());
    expect(LogLevel.buildFromString('DEBUG').getPriority()).toBe(LogLevel.DEBUG.getPriority());
    expect(LogLevel.buildFromString('INFO').getPriority()).toBe(LogLevel.INFO.getPriority());
    expect(LogLevel.buildFromString('WARN').getPriority()).toBe(LogLevel.WARN.getPriority());
    expect(LogLevel.buildFromString('ERROR').getPriority()).toBe(LogLevel.ERROR.getPriority());
    expect(LogLevel.buildFromString('FATAL').getPriority()).toBe(LogLevel.FATAL.getPriority());
  });

  it('should handle non existent colorize library', () => {
    expect(() => LogLevel.TRACE.getColorFunction()('message')).not.toThrow();
  });
});
