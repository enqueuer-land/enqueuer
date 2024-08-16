import { Configuration } from './configuration';
import { FileConfiguration } from './file-configuration';
import { CommandLineConfiguration } from './command-line-configuration';
import prettyjson from 'prettyjson';

const mockedCommandLineConfiguration = CommandLineConfiguration as jest.Mock;

jest.mock('./file-configuration');
jest.mock('./command-line-configuration');
jest.mock('prettyjson');

describe('Configuration', () => {
  beforeEach(() => {
    // @ts-ignore
    Configuration.loaded = false;
  });

  it('should addFiles', () => {
    const commandLine = createEmptyCommandLine();
    // @ts-ignore
    CommandLineConfiguration.mockImplementationOnce(() => commandLine);

    const instance = Configuration.getInstance();
    instance.addFiles('file1', 'file2');

    expect(instance.getFiles().sort()).toEqual(['file1', 'file2'].sort());
  });

  it('should call verifyPrematureActions', () => {
    const commandLine = createEmptyCommandLine();
    mockedCommandLineConfiguration.mockImplementationOnce(() => commandLine);
    commandLine.verifyPrematureActions = jest.fn(() => true);

    const instance = Configuration.getInstance();

    expect(commandLine.verifyPrematureActions).toBeCalled();
  });

  it('should check default values', () => {
    mockedCommandLineConfiguration.mockImplementationOnce(() => createEmptyCommandLine());

    const instance = Configuration.getInstance();

    expect(instance.isParallel()).toBeFalsy();
    expect(instance.getFiles()).toEqual([]);
    expect(instance.getLogLevel()).toBe('warn');
    expect(instance.getMaxReportLevelPrint()).toBe(1);
    expect(instance.getStore()).toEqual({});
    expect(instance.getPlugins()).toEqual([]);
    expect(instance.getOutputs()).toEqual([]);
    expect(instance.getMaxReportLevelPrint()).toEqual(1);
  });

  it('should work with only command line', () => {
    const commandLine = createCommandLine();
    mockedCommandLineConfiguration.mockImplementationOnce(() => commandLine);

    const instance = Configuration.getInstance();

    expect(instance.getFiles()).toEqual(['cli-firstFile', 'cli-secondFile']);
    expect(instance.getLogLevel()).toBe('cli-debug');
    expect(instance.getStore()).toEqual({ cliKey: 'value' });
    expect(instance.getPlugins()).toEqual(['cli-amqp-plugin', 'common-plugin']);
    expect(instance.isParallel()).toBeFalsy();
    expect(instance.getMaxReportLevelPrint()).toBe(5);
  });

  it('should work with only conf file', () => {
    mockedCommandLineConfiguration.mockImplementationOnce(() => createEmptyCommandLine('confFile'));
    (FileConfiguration as jest.Mock).mockImplementationOnce(() => createFileConfiguration());

    const instance = Configuration.getInstance();

    expect(instance.isParallel()).toBeTruthy();
    expect(instance.getFiles()).toEqual(['confFile-1', 'confFile-2']);
    expect(instance.getLogLevel()).toBe('confFile-fatal');
    expect(instance.getMaxReportLevelPrint()).toBe(13);
    expect(instance.getStore()).toEqual({
      confFileStore: 'yml',
      confFileKey: 'file report output'
    });
    expect(instance.getPlugins()).toEqual(['confFile-plugin', 'confFile-plugin-2', 'common-plugin']);
  });

  it('should handle file not found', () => {
    mockedCommandLineConfiguration.mockImplementationOnce(() => createEmptyCommandLine('not to throw'));
    // @ts-ignore
    FileConfiguration.mockImplementationOnce(() => {
      throw 'error';
    });

    expect(() => Configuration.getInstance()).not.toThrow();
  });

  it('should merge command line with conf file', () => {
    const commandLine = createCommandLine('conf-file');
    const fileConfiguration = createFileConfiguration();
    mockedCommandLineConfiguration.mockImplementationOnce(() => commandLine);
    // @ts-ignore
    FileConfiguration.mockImplementationOnce(() => fileConfiguration);

    const instance = Configuration.getInstance();

    expect(instance.isParallel()).toBeTruthy();
    expect(instance.getFiles()).toEqual(fileConfiguration.getFiles().concat(commandLine.getTestFiles()));
    expect(instance.getLogLevel()).toBe(commandLine.getVerbosity());
    expect(instance.getMaxReportLevelPrint()).toBe(commandLine.getMaxReportLevelPrint());
    expect(instance.getStore()).toEqual(Object.assign({}, fileConfiguration.getStore(), commandLine.getStore()));
  });

  it('should ignore files', () => {
    const uniqueFiles = ['unique-file1', 'unique-file2'];
    const fileConfiguration = createFileConfiguration();
    const commandLine = createCommandLine('conf-file');
    // @ts-ignore
    commandLine.getTestFilesIgnoringOthers = () => uniqueFiles;
    mockedCommandLineConfiguration.mockImplementationOnce(() => commandLine);
    // @ts-ignore
    FileConfiguration.mockImplementationOnce(() => fileConfiguration);

    const instance = Configuration.getInstance();

    expect(instance.getFiles()).toEqual(uniqueFiles);
  });

  it('should combine plugins', () => {
    const commandLine = createCommandLine('conf-file');
    const fileConfiguration = createFileConfiguration();
    const manuallyAddedPlugins = ['common-plugin', 'manuallyAddedPlugin'];
    mockedCommandLineConfiguration.mockImplementationOnce(() => commandLine);
    // @ts-ignore
    FileConfiguration.mockImplementationOnce(() => fileConfiguration);

    // const configuration = Configuration.getInstance();
    // manuallyAddedPlugins.forEach(plugin => configuration.addPlugin(plugin));

    // const confPlugins = configuration.getPlugins();
    // const uniquePlugins = [...new Set(commandLine.getPlugins()
    //     .concat(fileConfiguration.getPlugins())
    //     .concat(manuallyAddedPlugins))];
    // expect(confPlugins.length).toBe(uniquePlugins.length);
    // confPlugins.forEach(confPlugin => expect(uniquePlugins).toContainEqual(confPlugin));
  });

  it('should create cli output formatter', () => {
    const commandLine = createCommandLine();
    commandLine.getStdoutRequisitionOutput = () => true;
    mockedCommandLineConfiguration.mockImplementationOnce(() => commandLine);

    const instance = Configuration.getInstance();

    expect(instance.getOutputs()).toEqual([
      {
        format: 'console',
        name: 'command line report output',
        type: 'standard-output'
      }
    ]);
  });

  it('should print configuration', () => {
    const commandLine = createCommandLine();
    commandLine.getVerbosity = () => 'trace';
    // @ts-ignore
    CommandLineConfiguration.mockImplementationOnce(() => commandLine);
    const render = jest.fn();
    // @ts-ignore
    prettyjson.render.mockImplementation(render);

    const instance = Configuration.getInstance();

    expect(render).toHaveBeenCalledWith(
      {
        configuration: {
          files: ['cli-firstFile', 'cli-secondFile'],
          logLevel: 'trace',
          maxReportLevelPrint: 5,
          outputs: [
            {
              format: 'console',
              name: 'command line report output',
              type: 'standard-output'
            }
          ],
          parallel: false,
          showExplicitTestsOnly: false,
          showPassingTests: true,
          plugins: ['cli-amqp-plugin', 'common-plugin'],
          store: { cliKey: 'value' }
        }
      },
      expect.anything()
    );
  });

  const createEmptyCommandLine = (filename?: string) => {
    return {
      verifyPrematureActions: () => true,
      getConfigFileName: () => filename,
      getTestFiles: () => undefined,
      getVerbosity: () => undefined,
      getPlugins: () => undefined,
      getShowPassingTests: () => undefined,
      getShowExplicitTestsOnly: () => undefined,
      getStore: () => undefined,
      getTestFilesIgnoringOthers: () => undefined,
      getStdoutRequisitionOutput: () => false,
      getMaxReportLevelPrint: () => undefined
    };
  };

  const createCommandLine = (filename?: string) => {
    return {
      verifyPrematureActions: () => true,
      getConfigFileName: () => filename,
      getTestFiles: () => ['cli-firstFile', 'cli-secondFile'],
      getVerbosity: () => 'cli-debug',
      getPlugins: () => ['cli-amqp-plugin', 'common-plugin'],
      getStore: () => {
        return {
          cliKey: 'value'
        };
      },
      getShowPassingTests: () => true,
      getShowExplicitTestsOnly: () => false,
      getTestFilesIgnoringOthers: () => undefined,
      getStdoutRequisitionOutput: () => true,
      getMaxReportLevelPrint: () => 5
    };
  };

  const createFileConfiguration = () => {
    return {
      getLogLevel: () => 'confFile-fatal',
      getOutputs: () => {
        return {
          type: 'confFile-type',
          format: 'yml',
          name: 'confFile report output'
        };
      },
      getStore: () => {
        return { confFileStore: 'yml', confFileKey: 'file report output' };
      },
      getPlugins: () => ['confFile-plugin', 'confFile-plugin-2', 'common-plugin'],
      isParallelExecution: () => true,
      getFiles: () => ['confFile-1', 'confFile-2'],
      getMaxReportLevelPrint: () => 13
    };
  };
});
