declare module 'loggers/logger' {
	export class Logger {
	    private static logger?;
	    static setLoggerLevel(level?: string): void;
	    static trace(message: string): void;
	    static debug(message: string): void;
	    static info(message: string): void;
	    static warning(message: string): void;
	    static error(message: string): void;
	    static fatal(message: string): void;
	    private static getLogger;
	}

}
declare module 'models/outputs/test-model' {
	export interface TestModel {
	    ignored?: boolean;
	    description: string;
	    valid: boolean;
	    name: string;
	}
	export function testModelIsPassing(test: {
	    ignored?: boolean;
	    valid: boolean;
	}): boolean;

}
declare module 'models/outputs/report-model' {
	import { TestModel } from 'models/outputs/test-model';
	export interface ReportModel {
	    [indexSignature: string]: any;
	    name: string;
	    valid: boolean;
	    ignored?: boolean;
	    tests: TestModel[];
	}
	export function reportModelIsPassing(reportModel: ReportModel): boolean;

}
declare module 'models/outputs/time-model' {
	export interface TimeModel {
	    totalTime: number;
	    startTime: Date | string;
	    endTime: Date | string;
	    timeout?: number;
	}

}
declare module 'models/outputs/subscription-model' {
	import { ReportModel } from 'models/outputs/report-model';
	export interface SubscriptionModel extends ReportModel {
	    id: string;
	    type: string;
	    messageReceived?: any;
	    connectionTime?: Date | string;
	    messageReceivedTime?: Date | string;
	}

}
declare module 'models/outputs/publisher-model' {
	import { ReportModel } from 'models/outputs/report-model';
	export interface PublisherModel extends ReportModel {
	    id: string;
	    type: string;
	    messageReceived?: any;
	    publishTime?: Date | string;
	}

}
declare module 'models/outputs/requisition-model' {
	import { ReportModel } from 'models/outputs/report-model';
	import { TimeModel } from 'models/outputs/time-model';
	import { SubscriptionModel } from 'models/outputs/subscription-model';
	import { PublisherModel } from 'models/outputs/publisher-model';
	export interface RequisitionModel extends ReportModel {
	    id: string;
	    time: TimeModel;
	    publishers: PublisherModel[];
	    subscriptions: SubscriptionModel[];
	    requisitions: RequisitionModel[];
	    level?: number;
	}

}
declare module 'models/events/assertion' {
	export interface Assertion {
	    name: string;
	    ignore?: boolean;
	    [propName: string]: any;
	}

}
declare module 'models/events/event' {
	import { Assertion } from 'models/events/assertion';
	export interface Event {
	    script?: string;
	    assertions?: Assertion[];
	    store?: {
	        [propName: string]: any;
	    };
	}

}
declare module 'models/events/finishable' {
	import { Event } from 'models/events/event';
	export interface Finishable {
	    onFinish?: Event;
	}

}
declare module 'models/events/initializable' {
	import { Event } from 'models/events/event';
	export interface Initializable {
	    onInit?: Event;
	}

}
declare module 'models/events/message-receiver' {
	import { Event } from 'models/events/event';
	export interface MessageReceiver {
	    messageReceived?: any;
	    onMessageReceived?: Event;
	}

}
declare module 'models/inputs/publisher-model' {
	import { Finishable } from 'models/events/finishable';
	import { Initializable } from 'models/events/initializable';
	import { MessageReceiver } from 'models/events/message-receiver';
	export interface PublisherModel extends Finishable, Initializable, MessageReceiver {
	    type: string;
	    name: string;
	    [propName: string]: any;
	}

}
declare module 'publishers/publisher' {
	import { PublisherModel } from 'models/inputs/publisher-model';
	import { Event } from 'models/events/event';
	export abstract class Publisher {
	    type: string;
	    payload: any;
	    name: string;
	    onMessageReceived?: Event;
	    onInit?: Event;
	    onFinish?: Event;
	    messageReceived?: any;
	    ignore: boolean;
	    [propName: string]: any;
	    protected constructor(publisherAttributes: PublisherModel);
	    abstract publish(): Promise<void>;
	}

}
declare module 'outputs/formatters/report-formatter' {
	import { RequisitionModel } from 'models/outputs/requisition-model';
	export interface ReportFormatter {
	    format(report: RequisitionModel): string;
	}

}
declare module 'models/inputs/subscription-model' {
	import { Finishable } from 'models/events/finishable';
	import { Initializable } from 'models/events/initializable';
	import { MessageReceiver } from 'models/events/message-receiver';
	export interface SubscriptionModel extends Finishable, Initializable, MessageReceiver {
	    type: string;
	    name: string;
	    response?: any;
	    avoid?: boolean;
	    timeout?: number;
	    [propName: string]: any;
	}

}
declare module 'subscriptions/subscription' {
	import { SubscriptionModel } from 'models/inputs/subscription-model';
	import { TestModel } from 'models/outputs/test-model';
	import { Event } from 'models/events/event';
	export abstract class Subscription {
	    name: string;
	    messageReceived?: any;
	    timeout?: number;
	    onMessageReceived?: Event;
	    onFinish?: Event;
	    response?: any;
	    type: string;
	    avoid: boolean;
	    ignore: boolean;
	    [propName: string]: any;
	    protected constructor(subscriptionAttributes: SubscriptionModel);
	    abstract subscribe(): Promise<void>;
	    abstract receiveMessage(): Promise<any>;
	    unsubscribe(): Promise<void>;
	    sendResponse(): Promise<void>;
	    onMessageReceivedTests(): TestModel[];
	}

}
declare module 'subscriptions/null-subscription' {
	import { Subscription } from 'subscriptions/subscription';
	import { SubscriptionModel } from 'models/inputs/subscription-model';
	export class NullSubscription extends Subscription {
	    constructor(subscriptionAttributes: SubscriptionModel);
	    subscribe(): Promise<void>;
	    receiveMessage(): Promise<any>;
	}

}
declare module 'publishers/null-publisher' {
	import { Publisher } from 'publishers/publisher';
	import { PublisherModel } from 'models/inputs/publisher-model';
	export class NullPublisher extends Publisher {
	    constructor(publisherModel: PublisherModel);
	    publish(): Promise<void>;
	}

}
declare module 'protocols/protocol' {
	export enum ProtocolType {
	    PUBLISHER = 0,
	    SUBSCRIPTION = 1
	}
	export abstract class Protocol {
	    readonly type: ProtocolType;
	    private readonly name;
	    private alternativeNames?;
	    private library?;
	    protected constructor(name: string, type: ProtocolType);
	    protected getDeepDescription(): any;
	    getName(): string;
	    getDescription(): any;
	    addAlternativeName(...alternativeNames: string[]): Protocol;
	    setLibrary(libraryName: string): Protocol;
	    matches(type: string): boolean;
	    private isLibraryInstalled;
	    private createLibrary;
	}

}
declare module 'protocols/publisher-protocol' {
	import { Protocol } from 'protocols/protocol';
	import { PublisherModel } from 'models/inputs/publisher-model';
	import { Publisher } from 'publishers/publisher';
	export class PublisherProtocol extends Protocol {
	    private readonly messageReceivedParams;
	    private readonly createFunction;
	    constructor(name: string, createFunction: (publisherModel: PublisherModel) => Publisher, messageReceivedParams?: string[]);
	    create(publisher: PublisherModel): Publisher;
	    protected getDeepDescription(): any;
	}

}
declare module 'protocols/subscription-protocol' {
	import { Protocol } from 'protocols/protocol';
	import { SubscriptionModel } from 'models/inputs/subscription-model';
	import { Subscription } from 'subscriptions/subscription';
	export class SubscriptionProtocol extends Protocol {
	    private readonly messageReceivedParams;
	    private readonly createFunction;
	    constructor(name: string, createFunction: (subscriptionModel: SubscriptionModel) => Subscription, messageReceivedParams: string[]);
	    create(subscription: SubscriptionModel): Subscription;
	    protected getDeepDescription(): any;
	}

}
declare module 'outputs/prettyjson-config' {
	export function getPrettyJsonConfig(): {
	    defaultIndentation: number;
	    inlineArrays: boolean;
	    emptyArrayMsg: string;
	    keysColor: string;
	    dashColor: string;
	};

}
declare module 'plugins/protocol-manager' {
	import { PublisherModel } from 'models/inputs/publisher-model';
	import { Publisher } from 'publishers/publisher';
	import { SubscriptionModel } from 'models/inputs/subscription-model';
	import { Subscription } from 'subscriptions/subscription';
	import { Protocol } from 'protocols/protocol';
	export class ProtocolManager {
	    private protocols;
	    createPublisher(publisherModel: PublisherModel): Publisher;
	    createSubscription(subscriptionModel: SubscriptionModel): Subscription;
	    addProtocol(protocol: Protocol): void;
	    getMatchingProtocols(describeProtocols: string | true): any;
	    describeMatchingProtocols(description: any): boolean;
	    private createDescription;
	}

}
declare module 'outputs/formatters/json-formatter' {
	import { ReportFormatter } from 'outputs/formatters/report-formatter';
	import { RequisitionModel } from 'models/outputs/requisition-model';
	import { MainInstance } from 'plugins/main-instance';
	export class JsonReportFormatter implements ReportFormatter {
	    format(report: RequisitionModel): string;
	}
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'plugins/report-formatter-manager' {
	import { ReportFormatter } from 'outputs/formatters/report-formatter';
	export class ReportFormatterManager {
	    private formatters;
	    createReportFormatter(format: string): ReportFormatter;
	    addReportFormatter(createFunction: () => ReportFormatter, firstTag: string, ...tags: string[]): void;
	    getMatchingReportFormatters(describeFormatters: string | true): {
	        formatters: string[][];
	    };
	    describeMatchingReportFormatters(describeFormatters: string | true): boolean;
	}

}
declare module 'object-parser/object-parser' {
	export interface ObjectParser {
	    parse(value: string, query?: any): object;
	}

}
declare module 'plugins/object-parser-manager' {
	import { ObjectParser } from 'object-parser/object-parser';
	export class ObjectParserManager {
	    private addedObjectParsers;
	    addObjectParser(createFunction: () => ObjectParser, firstTag: string, ...tags: string[]): void;
	    getMatchingObjectParsers(describeObjectParsers: string | true): any;
	    describeMatchingObjectParsers(data: any): boolean;
	    createParser(tag: string): ObjectParser | undefined;
	    tryToParseWithParsers(fileBufferContent: string, tags?: string[]): object;
	}

}
declare module 'asserters/asserter' {
	import { Assertion } from 'models/events/assertion';
	import { TestModel } from 'models/outputs/test-model';
	export interface Asserter {
	    assert(assertion: Assertion, literal: any): TestModel;
	}

}
declare module 'asserters/null-asserter' {
	import { Assertion } from 'models/events/assertion';
	import { TestModel } from 'models/outputs/test-model';
	import { Asserter } from 'asserters/asserter';
	export class NullAsserter implements Asserter {
	    assert(assertion: Assertion, literal: any): TestModel;
	}

}
declare module 'plugins/asserter-manager' {
	import { Assertion } from 'models/events/assertion';
	import { Asserter } from 'asserters/asserter'; type AssertionFieldTypes = ('string' | 'number' | 'boolean' | 'array' | 'null' | 'any'); type AssertionField = {
	    required?: boolean;
	    type?: AssertionFieldTypes[] | AssertionFieldTypes;
	    description?: string;
	};
	export interface AssertionTemplate {
	    [assertionField: string]: AssertionField;
	}
	export class AsserterManager {
	    private addedAsserters;
	    createAsserter(assertion: Assertion): Asserter;
	    addAsserter(templateAssertion: AssertionTemplate, createFunction: () => Asserter): void;
	    describeMatchingAsserters(data: any): boolean;
	    getMatchingAsserters(field: string | true): {
	        asserters: AssertionTemplate[];
	    };
	}
	export {};

}
declare module 'plugins/main-instance' {
	import { ProtocolManager } from 'plugins/protocol-manager';
	import { ReportFormatterManager } from 'plugins/report-formatter-manager';
	import { ObjectParserManager } from 'plugins/object-parser-manager';
	import { AsserterManager } from 'plugins/asserter-manager';
	export interface MainInstance {
	    readonly protocolManager: ProtocolManager;
	    readonly reportFormatterManager: ReportFormatterManager;
	    readonly objectParserManager: ObjectParserManager;
	    readonly asserterManager: AsserterManager;
	}

}
declare module 'configurations/command-line-configuration' {
	export class CommandLineConfiguration {
	    private parsedCommandLine;
	    private readonly commandLineStore;
	    private readonly plugins;
	    private readonly testFiles;
	    private readonly testFilesIgnoringOthers;
	    constructor(commandLineArguments: string[]);
	    verifyPrematureActions(): void;
	    getVerbosity(): string;
	    getStdoutRequisitionOutput(): boolean;
	    getConfigFileName(): string | undefined;
	    getStore(): any;
	    getTestFiles(): string[];
	    getTestFilesIgnoringOthers(): string[];
	    getPlugins(): string[];
	    getMaxReportLevelPrint(): number | undefined;
	    getVersion(): string;
	    private storeCommandLineAction;
	    private helpDescription;
	}

}
declare module 'object-parser/object-decycler' {
	export class ObjectDecycler {
	    private readonly circularReplacer?;
	    private cache;
	    constructor(circularReplacer?: string);
	    decycle(value: object): object;
	    private isObject;
	    private isNotNull;
	    private register;
	    private isRegistered;
	    private jsonStringifyReplacer;
	}

}
declare module 'object-parser/yml-object-parser' {
	import { ObjectParser } from 'object-parser/object-parser';
	import { MainInstance } from 'plugins/main-instance';
	export class YmlObjectParser implements ObjectParser {
	    parse(value: string): object;
	    stringify(value: object, params?: any): string;
	    private parseParams;
	}
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'configurations/file-configuration' {
	import { PublisherModel } from 'models/inputs/publisher-model';
	export class FileConfiguration {
	    private readonly parsedFile;
	    constructor(filename: string);
	    getLogLevel(): string;
	    getOutputs(): PublisherModel[];
	    getStore(): any;
	    getPlugins(): string[];
	    isParallelExecution(): boolean;
	    getFiles(): string[];
	    getMaxReportLevelPrint(): number;
	}

}
declare module 'configurations/configuration' {
	import { PublisherModel } from 'models/inputs/publisher-model';
	export class Configuration {
	    private static instance;
	    private static loaded;
	    private parallel;
	    private files;
	    private logLevel;
	    private outputs;
	    private maxReportLevelPrint;
	    private store;
	    private plugins;
	    private commandLineConfiguration;
	    private constructor();
	    static getInstance(): Configuration;
	    getValues(): Configuration;
	    addPlugin(pluginName: string): boolean;
	    isParallel(): boolean;
	    getFiles(): string[];
	    getLogLevel(): string;
	    getOutputs(): PublisherModel[];
	    getMaxReportLevelPrint(): number;
	    getStore(): any;
	    getPlugins(): string[];
	    private adjustFromCommandLine;
	    private adjustFromFile;
	    private static printConfiguration;
	}

}
declare module 'plugins/dynamic-modules-manager' {
	import { ProtocolManager } from 'plugins/protocol-manager';
	import { ReportFormatterManager } from 'plugins/report-formatter-manager';
	import { ObjectParserManager } from 'plugins/object-parser-manager';
	import { AsserterManager } from 'plugins/asserter-manager';
	export class DynamicModulesManager {
	    private static instance;
	    private readonly protocolManager;
	    private readonly reportFormatterManager;
	    private readonly objectParserManager;
	    private readonly asserterManager;
	    private readonly builtInModules;
	    private readonly implicitModules;
	    private explicitModules;
	    private constructor();
	    static getInstance(): DynamicModulesManager;
	    getBuiltInModules(): string[];
	    getImplicitModules(): string[];
	    getLoadedModules(): {
	        implicit: string[];
	        explicit: string[];
	    };
	    getProtocolManager(): ProtocolManager;
	    getAsserterManager(): AsserterManager;
	    getReportFormatterManager(): ReportFormatterManager;
	    getObjectParserManager(): ObjectParserManager;
	    describeLoadedModules(): void;
	    loadModuleExplicitly(module: string): boolean;
	    private loadModule;
	    private findEveryEntryPointableBuiltInModule;
	    private findEveryEnqueuerImplicitPluginPackage;
	    private initialModulesLoad;
	}

}
declare module 'outputs/multi-tests-output' {
	import { RequisitionModel } from 'models/outputs/requisition-model';
	import { PublisherModel } from 'models/inputs/publisher-model';
	export class MultiTestsOutput {
	    private outputs;
	    constructor(outputs: PublisherModel[]);
	    publishReport(report: RequisitionModel): Promise<void>;
	}

}
declare module 'models/inputs/requisition-model' {
	import { SubscriptionModel } from 'models/inputs/subscription-model';
	import { Finishable } from 'models/events/finishable';
	import { Initializable } from 'models/events/initializable';
	import { PublisherModel } from 'models/inputs/publisher-model';
	export interface RequisitionModel extends Finishable, Initializable {
	    timeout: number;
	    id: string;
	    name: string;
	    subscriptions: SubscriptionModel[];
	    publishers: PublisherModel[];
	    parent?: RequisitionModel;
	    delay: number;
	    iterations: number;
	    ignore?: boolean;
	    import?: RequisitionModel;
	    requisitions: RequisitionModel[];
	    [propName: string]: any;
	}

}
declare module 'timers/date-controller' {
	export class DateController {
	    private date;
	    constructor(date?: Date);
	    toString(): string;
	    private leftPad;
	    getStringOnlyNumbers(): string;
	    getTime(): number;
	}

}
declare module 'requisition-runners/requisition-validator' {
	import { RequisitionModel } from 'models/inputs/requisition-model';
	export class RequisitionValidator {
	    validate(requisition: RequisitionModel): boolean;
	    getErrorMessage(): string;
	}

}
declare module 'requisition-runners/requisition-parser' {
	import { RequisitionModel } from 'models/inputs/requisition-model';
	export class RequisitionParser {
	    parse(content: string): RequisitionModel;
	}

}
declare module 'requisition-runners/requisition-file-parser' {
	import { RequisitionModel } from 'models/inputs/requisition-model';
	export class RequisitionFileParser {
	    parseFile(filename: string): RequisitionModel;
	}

}
declare module 'requisition-runners/requisition-file-pattern-parser' {
	import { TestModel } from 'models/outputs/test-model';
	import { RequisitionModel } from 'models/inputs/requisition-model';
	export class RequisitionFilePatternParser {
	    private readonly patterns;
	    private filesErrors;
	    constructor(patterns: string[]);
	    getFilesErrors(): TestModel[];
	    parse(): RequisitionModel[];
	    private getMatchingFiles;
	    private addError;
	}

}
declare module 'models-defaults/outputs/requisition-default-reports' {
	import * as output from 'models/outputs/requisition-model';
	import { TestModel } from 'models/outputs/test-model';
	export class RequisitionDefaultReports {
	    static createDefaultReport(base: {
	        name: string;
	        id: string;
	        ignored?: boolean;
	    }, tests?: TestModel[]): output.RequisitionModel;
	    static createRunningError(base: {
	        name: string;
	        id: string;
	    }, err: any): output.RequisitionModel;
	    static createSkippedReport(base: {
	        name: string;
	        id: string;
	    }): output.RequisitionModel;
	    static createIgnoredReport(base: {
	        name: string;
	        id: string;
	        ignored?: true;
	    }): output.RequisitionModel;
	    static createIteratorReport(base: {
	        name: string;
	        id: string;
	    }): output.RequisitionModel;
	}

}
declare module 'reporters/requisition-report-generator' {
	import * as input from 'models/inputs/requisition-model';
	import { RequisitionModel } from 'models/outputs/requisition-model';
	import { SubscriptionModel } from 'models/outputs/subscription-model';
	import { TestModel } from 'models/outputs/test-model';
	import { PublisherModel } from 'models/outputs/publisher-model';
	export class RequisitionReportGenerator {
	    private startTime;
	    private readonly timeout?;
	    private readonly report;
	    constructor(requisitionAttributes: input.RequisitionModel, timeout?: number);
	    setPublishersReport(publishersReport: PublisherModel[]): void;
	    setSubscriptionsReport(subscriptionReport: SubscriptionModel[]): void;
	    getReport(): RequisitionModel;
	    finish(): void;
	    addError(error: TestModel): void;
	    addTests(tests: TestModel[]): void;
	    private addTimesReport;
	    private generateTimesReport;
	}

}
declare module 'timers/timeout' {
	export class Timeout {
	    private timer?;
	    private callback;
	    constructor(callBack: Function);
	    start(period: number): void;
	    clear(): void;
	}

}
declare module 'code-generators/assertion-code-generator' {
	export class AssertionCodeGenerator {
	    private readonly testsName;
	    private readonly assertionName;
	    private readonly asserterInstanceName;
	    constructor(testsName: string, asserterInstanceName: string, assertionName: string);
	    generate(): string;
	}

}
declare module 'code-generators/store-code-generator' {
	export class StoreCodeGenerator {
	    private readonly testsName;
	    private readonly storeInstanceName;
	    constructor(testsName: string, storeInstanceName: string);
	    generate(store: any): string;
	}

}
declare module 'dynamic-functions/dynamic-function-controller' {
	export class DynamicFunctionController {
	    private readonly functionBody;
	    private arguments;
	    constructor(functionBody: string);
	    addArgument(name: string, value: any): void;
	    execute(): any;
	    private createFunction;
	    private executeFunction;
	}

}
declare module 'configurations/store' {
	export class Store {
	    private static data;
	    private constructor();
	    static getData(): any;
	    static refreshData(): any;
	}

}
declare module 'code-generators/event-code-generator' {
	import { Event } from 'models/events/event';
	import { TestModel } from 'models/outputs/test-model';
	export class EventCodeGenerator {
	    private readonly tests;
	    private readonly testsInstanceName;
	    private readonly asserterInstanceName;
	    private readonly storeInstanceName;
	    private readonly script;
	    private readonly store;
	    private readonly name;
	    private assertions;
	    constructor(eventValue: Event, eventName?: string);
	    run(functionArguments: {
	        name: string;
	        value: any;
	    }[]): TestModel[];
	    private runScriptAndStore;
	    private getScriptSnippet;
	    private getStoreSnippet;
	    private runAssertions;
	}

}
declare module 'events/event-executor' {
	import { Event } from 'models/events/event';
	import { TestModel } from 'models/outputs/test-model';
	export abstract class EventExecutor {
	    private arguments;
	    private readonly event;
	    private readonly name;
	    protected constructor(name: string, event?: Event);
	    abstract trigger(): TestModel[];
	    addArgument(name: string, value: any): void;
	    protected execute(): TestModel[];
	    private initializeEvent;
	    private baptizeAssertions;
	}

}
declare module 'events/on-init-event-executor' {
	import { EventExecutor } from 'events/event-executor';
	import { Initializable } from 'models/events/initializable';
	import { TestModel } from 'models/outputs/test-model';
	export class OnInitEventExecutor extends EventExecutor {
	    private readonly initializable;
	    constructor(name: string, initializable: Initializable);
	    trigger(): TestModel[];
	}

}
declare module 'events/on-message-received-event-executor' {
	import { MessageReceiver } from 'models/events/message-receiver';
	import { EventExecutor } from 'events/event-executor';
	import { TestModel } from 'models/outputs/test-model';
	export class OnMessageReceivedEventExecutor extends EventExecutor {
	    private readonly messageReceiver;
	    constructor(name: string, messageReceiver: MessageReceiver);
	    trigger(): TestModel[];
	}

}
declare module 'reporters/subscription/subscription-final-reporter' {
	import { TestModel } from 'models/outputs/test-model';
	export type Time = {
	    timeout?: number;
	    totalTime: number;
	};
	export type Summary = {
	    subscribed: boolean;
	    avoidable: boolean;
	    hasMessage: boolean;
	    time?: Time;
	    ignore?: boolean;
	    subscribeError?: string;
	};
	export class SubscriptionFinalReporter {
	    private messageReceivedTestName;
	    private subscriptionAvoidedTestName;
	    private noTimeOutTestName;
	    private subscribedTestName;
	    private readonly subscribed;
	    private readonly avoidable;
	    private readonly hasMessage;
	    private readonly ignore;
	    private readonly time?;
	    private readonly subscribeError?;
	    constructor(summary: Summary);
	    getReport(): TestModel[];
	    private addTimeoutTests;
	    private createNotSubscribedTests;
	    private createMessageTests;
	    private createTimeoutTests;
	    private createAvoidableTests;
	}

}
declare module 'events/on-finish-event-executor' {
	import { EventExecutor } from 'events/event-executor';
	import { TestModel } from 'models/outputs/test-model';
	import { Finishable } from 'models/events/finishable';
	export class OnFinishEventExecutor extends EventExecutor {
	    private readonly finishable;
	    constructor(name: string, finishable: Finishable);
	    trigger(): TestModel[];
	}

}
declare module 'reporters/subscription/subscription-reporter' {
	import * as input from 'models/inputs/subscription-model';
	import * as output from 'models/outputs/subscription-model';
	export class SubscriptionReporter {
	    private static readonly DEFAULT_TIMEOUT;
	    private readonly killListener;
	    private readonly report;
	    private readonly startTime;
	    private readonly subscription;
	    private subscribeError?;
	    private hasTimedOut;
	    private subscribed;
	    private totalTime?;
	    constructor(subscriptionAttributes: input.SubscriptionModel);
	    hasFinished(): boolean;
	    startTimeout(onTimeOutCallback: Function): void;
	    subscribe(): Promise<void>;
	    receiveMessage(): Promise<any>;
	    private handleSubscription;
	    private sendSyncResponse;
	    getReport(): output.SubscriptionModel;
	    unsubscribe(): Promise<void>;
	    onFinish(): void;
	    private handleMessageArrival;
	    private executeOnInitFunction;
	    private executeOnMessageReceivedFunction;
	    private handleKillSignal;
	}

}
declare module 'strings/id-generator' {
	export class IdGenerator {
	    private readonly value;
	    constructor(value: any);
	    generateId(): string;
	}

}
declare module 'components/requisition-adopter' {
	import { RequisitionModel } from 'models/inputs/requisition-model';
	export class RequisitionAdopter {
	    private readonly requisition;
	    private defaultModel;
	    constructor(node: any);
	    getRequisition(): RequisitionModel;
	    private baptiseRequisition;
	    private putNameAndId;
	}

}
declare module 'requisition-runners/component-importer' {
	import { RequisitionModel } from 'models/inputs/requisition-model';
	import { SubscriptionModel } from 'models/inputs/subscription-model';
	import { PublisherModel } from 'models/inputs/publisher-model';
	export class ComponentImporter {
	    importRequisition(requisition: RequisitionModel): RequisitionModel;
	    importSubscription(subscription: SubscriptionModel): SubscriptionModel;
	    importPublisher(publisherModel: PublisherModel): PublisherModel;
	}

}
declare module 'reporters/subscription/multi-subscriptions-reporter' {
	import * as input from 'models/inputs/subscription-model';
	import * as output from 'models/outputs/subscription-model';
	export class MultiSubscriptionsReporter {
	    private subscriptions;
	    private timeoutPromise;
	    constructor(subscriptions: input.SubscriptionModel[]);
	    start(): void;
	    subscribe(): Promise<any>;
	    receiveMessage(): Promise<number>;
	    unsubscribe(): Promise<void[]>;
	    getReport(): output.SubscriptionModel[];
	    onFinish(): void;
	}

}
declare module 'reporters/publishers/publisher-reporter' {
	import { PublisherModel } from 'models/outputs/publisher-model';
	import * as input from 'models/inputs/publisher-model';
	export class PublisherReporter {
	    private readonly report;
	    private readonly publisher;
	    private readonly startTime;
	    constructor(publisher: input.PublisherModel);
	    publish(): Promise<void>;
	    getReport(): PublisherModel;
	    onFinish(): void;
	    private pushResponseMessageReceivedTest;
	    private executeOnMessageReceivedFunction;
	    private executeOnInitFunction;
	}

}
declare module 'reporters/publishers/multi-publishers-reporter' {
	import * as output from 'models/outputs/publisher-model';
	import * as input from 'models/inputs/publisher-model';
	export class MultiPublishersReporter {
	    private publishers;
	    constructor(publishers: input.PublisherModel[]);
	    publish(): Promise<number>;
	    onFinish(): void;
	    getReport(): output.PublisherModel[];
	}

}
declare module 'reporters/requisition-reporter' {
	import * as input from 'models/inputs/requisition-model';
	import * as output from 'models/outputs/requisition-model';
	export class RequisitionReporter {
	    static readonly DEFAULT_TIMEOUT: number;
	    private readonly timeout?;
	    private readonly requisitionAttributes;
	    private readonly startTime;
	    private reportGenerator;
	    private multiSubscriptionsReporter;
	    private multiPublishersReporter;
	    private hasFinished;
	    constructor(requisitionAttributes: input.RequisitionModel);
	    delay(): Promise<void>;
	    startTimeout(): Promise<output.RequisitionModel>;
	    execute(): Promise<output.RequisitionModel>;
	    private onRequisitionFinish;
	    private executeOnInitFunction;
	    private executeOnFinishFunction;
	}

}
declare module 'configurations/file-content-map-creator' {
	import { RequisitionModel } from 'models/inputs/requisition-model';
	export class FileContentMapCreator {
	    private map;
	    constructor(value: RequisitionModel);
	    getMap(): {};
	    private checkChildren;
	    private findTags;
	    private insertIntoMap;
	    private parsePlaceHolder;
	    private parseQuery;
	    private getValue;
	}

}
declare module 'requisition-runners/iterations-evaluator' {
	export class IterationsEvaluator {
	    iterations(iterations: number): number;
	}

}
declare module 'outputs/tests-analyzer' {
	import { TestModel } from 'models/outputs/test-model';
	import { ReportModel } from 'models/outputs/report-model';
	export interface AnalyzedTest extends TestModel {
	    hierarchy: string[];
	}
	export class TestsAnalyzer {
	    private tests;
	    addTest(report: ReportModel): TestsAnalyzer;
	    isValid(): boolean;
	    getTests(): AnalyzedTest[];
	    getNotIgnoredTests(): AnalyzedTest[];
	    getIgnoredList(): AnalyzedTest[];
	    getPassingTests(): AnalyzedTest[];
	    getFailingTests(): AnalyzedTest[];
	    getPercentage(): number;
	    private findRequisitions;
	    private findTests;
	    private computeTests;
	}

}
declare module 'outputs/summary-test-output' {
	import { ReportModel } from 'models/outputs/report-model';
	export type SummaryOptions = {
	    maxLevel?: number;
	    level?: number;
	    printFailingTests?: boolean;
	    tabulationPerLevel?: number;
	    summarySpacing?: number;
	};
	export class SummaryTestOutput {
	    private readonly report;
	    private readonly options;
	    constructor(report: ReportModel, options?: SummaryOptions);
	    print(): void;
	    private printChildren;
	    private printSelf;
	    private formatTitle;
	    private createEmptyStringSized;
	    private createSummary;
	    private printFailingTests;
	    private getColor;
	    private prettifyTestHierarchyMessage;
	}

}
declare module 'components/component-parent-backupper' {
	import { RequisitionModel } from 'models/inputs/requisition-model';
	export class ComponentParentBackupper {
	    private readonly parentMap;
	    removeParents(requisition: RequisitionModel): void;
	    putParentsBack(requisition: RequisitionModel): void;
	}

}
declare module 'requisition-runners/requisition-runner' {
	import * as input from 'models/inputs/requisition-model';
	import * as output from 'models/outputs/requisition-model';
	export class RequisitionRunner {
	    private readonly level;
	    private requisition;
	    constructor(requisition: input.RequisitionModel, level?: number);
	    run(): Promise<output.RequisitionModel[]>;
	    private iterateRequisition;
	    private importRequisition;
	    private printReport;
	    private replaceVariables;
	    private startRequisitionReporter;
	    private happyPath;
	    private executeChildren;
	    private executeChild;
	}

}
declare module 'enqueuer-runner' {
	export class EnqueuerRunner {
	    private static reportName;
	    private readonly startTime;
	    constructor();
	    execute(): Promise<boolean>;
	}

}
declare module 'enqueuer-starter' {
	export class EnqueuerStarter {
	    private enqueuerRunner;
	    constructor();
	    start(): Promise<number>;
	}

}
declare module 'index' {
	#!/usr/bin/env node
	export {};

}
declare module 'asserters/expect-to-be-defined-asserter' {
	import { Assertion } from 'models/events/assertion';
	import { TestModel } from 'models/outputs/test-model';
	import { Asserter } from 'asserters/asserter';
	import { MainInstance } from 'plugins/main-instance';
	export class ExpectToBeDefinedAsserter implements Asserter {
	    assert(assertion: Assertion, literal: any): TestModel;
	}
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'asserters/expect-to-be-equal-to-asserter' {
	import { Assertion } from 'models/events/assertion';
	import { TestModel } from 'models/outputs/test-model';
	import { Asserter } from 'asserters/asserter';
	import { MainInstance } from 'plugins/main-instance';
	export class ExpectToBeEqualToAsserter implements Asserter {
	    assert(assertion: Assertion, literal: any): TestModel;
	    private deepEqual;
	}
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'asserters/expect-to-be-falsy-asserter' {
	import { Assertion } from 'models/events/assertion';
	import { TestModel } from 'models/outputs/test-model';
	import { Asserter } from 'asserters/asserter';
	import { MainInstance } from 'plugins/main-instance';
	export class ExpectToBeFalsyAsserter implements Asserter {
	    assert(assertion: Assertion, literal: any): TestModel;
	}
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'asserters/expect-to-be-greater-than-asserter' {
	import { Assertion } from 'models/events/assertion';
	import { TestModel } from 'models/outputs/test-model';
	import { Asserter } from 'asserters/asserter';
	import { MainInstance } from 'plugins/main-instance';
	export class ExpectToBeGreaterThanAsserter implements Asserter {
	    assert(assertion: Assertion, literal: any): TestModel;
	}
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'asserters/expect-to-be-greater-than-or-equal-to-asserter' {
	import { Assertion } from 'models/events/assertion';
	import { TestModel } from 'models/outputs/test-model';
	import { Asserter } from 'asserters/asserter';
	import { MainInstance } from 'plugins/main-instance';
	export class ExpectToBeGreaterThanOrEqualToAsserter implements Asserter {
	    assert(assertion: Assertion, literal: any): TestModel;
	}
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'asserters/expect-to-be-less-than-asserter' {
	import { Assertion } from 'models/events/assertion';
	import { TestModel } from 'models/outputs/test-model';
	import { Asserter } from 'asserters/asserter';
	import { MainInstance } from 'plugins/main-instance';
	export class ExpectToBeLessThanAsserter implements Asserter {
	    assert(assertion: Assertion, literal: any): TestModel;
	}
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'asserters/expect-to-be-less-than-or-equal-to-asserter' {
	import { Assertion } from 'models/events/assertion';
	import { TestModel } from 'models/outputs/test-model';
	import { Asserter } from 'asserters/asserter';
	import { MainInstance } from 'plugins/main-instance';
	export class ExpectToBeLessThanOrEqualToAsserter implements Asserter {
	    assert(assertion: Assertion, literal: any): TestModel;
	}
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'asserters/expect-to-be-truthy-asserter' {
	import { Assertion } from 'models/events/assertion';
	import { TestModel } from 'models/outputs/test-model';
	import { Asserter } from 'asserters/asserter';
	import { MainInstance } from 'plugins/main-instance';
	export class ExpectToBeTruthyAsserter implements Asserter {
	    assert(assertion: Assertion, literal: any): TestModel;
	}
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'asserters/expect-to-be-undefined-asserter' {
	import { Assertion } from 'models/events/assertion';
	import { TestModel } from 'models/outputs/test-model';
	import { Asserter } from 'asserters/asserter';
	import { MainInstance } from 'plugins/main-instance';
	export class ExpectToBeUndefinedAsserter implements Asserter {
	    assert(assertion: Assertion, literal: any): TestModel;
	}
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'asserters/expect-to-contain-asserter' {
	import { Assertion } from 'models/events/assertion';
	import { TestModel } from 'models/outputs/test-model';
	import { Asserter } from 'asserters/asserter';
	import { MainInstance } from 'plugins/main-instance';
	export class ExpectToContainAsserter implements Asserter {
	    assert(assertion: Assertion, literal: any): TestModel;
	}
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'handlers/handler-listener' {
	export class HandlerListener {
	    static ADDRESS_IN_USE: string;
	    private server;
	    private remainingAttempts;
	    private retryTimeout;
	    private handler;
	    constructor(server: any, remainingAttempts?: number, retryTimeout?: number);
	    listen(handler: number | string): Promise<void>;
	    private tryToListen;
	    private handleError;
	    getHandler(): string | number;
	}

}
declare module 'handlers/stream-input-handler' {
	export class StreamInputHandler {
	    private readonly handlerListener;
	    private readonly server;
	    private handler;
	    constructor(handler: string | number);
	    subscribe(onMessageReceived: (requisition: any) => void): Promise<void>;
	    getHandler(): string | number;
	    unsubscribe(): Promise<void>;
	    sendResponse(stream: any, message: any): Promise<void>;
	    close(stream: any): void;
	    private stringifyPayloadReceived;
	    private stringifyPayloadToSend;
	}

}
declare module 'http-authentications/http-authentication' {
	import { TestModel } from 'models/outputs/test-model';
	export interface HttpAuthentication {
	    generate(): any;
	    verify(auth: any): TestModel[];
	}

}
declare module 'http-authentications/http-basic-authentication' {
	import { HttpAuthentication } from 'http-authentications/http-authentication';
	import { TestModel } from 'models/outputs/test-model';
	export class HttpBasicAuthentication implements HttpAuthentication {
	    private readonly user;
	    private readonly password;
	    private tests;
	    constructor(authentication: any);
	    generate(): any;
	    verify(authorization: string): TestModel[];
	    private basicAuthentication;
	    private authenticatePrefix;
	    private authenticateUser;
	    private authenticatePassword;
	}

}
declare module 'http-authentications/http-bearer-authentication' {
	import { HttpAuthentication } from 'http-authentications/http-authentication';
	import { TestModel } from 'models/outputs/test-model';
	export class HttpBearerAuthentication implements HttpAuthentication {
	    private readonly token;
	    constructor(authentication: any);
	    generate(): any;
	    verify(authorization: string): TestModel[];
	    private bearerAuthentication;
	    private authenticatePrefix;
	    private authenticateToken;
	}

}
declare module 'http-authentications/http-digest-authentication' {
	import { HttpAuthentication } from 'http-authentications/http-authentication';
	import { TestModel } from 'models/outputs/test-model';
	export class HttpDigestAuthentication implements HttpAuthentication {
	    static MD5_SESS: string;
	    private readonly qop;
	    private readonly algorithm;
	    private readonly nonce;
	    private readonly nonceCount;
	    private readonly clientNonce;
	    private readonly method;
	    private readonly uri;
	    private readonly username;
	    private readonly realm;
	    private readonly password;
	    private readonly opaque;
	    constructor(authentication: any);
	    generate(): any;
	    verify(authorization: string): TestModel[];
	    private buildEssentialFields;
	    private generateResponse;
	    private secondHash;
	    private firstHash;
	    private md5;
	    private createDigestValue;
	    private analyzeToken;
	    private attributeNotFoundTest;
	    private checkResponseValue;
	    private checkDigestPrefix;
	    private checkEssentialFieldsMissingInAuthorization;
	}

}
declare module 'http-authentications/http-no-authentication' {
	import { HttpAuthentication } from 'http-authentications/http-authentication';
	import { TestModel } from 'models/outputs/test-model';
	export class HttpNoAuthentication implements HttpAuthentication {
	    private readonly authentication;
	    constructor(authentication: any);
	    generate(): any;
	    verify(requisition: string): TestModel[];
	}

}
declare module 'http-authentications/http-authentication-factory' {
	import { HttpAuthentication } from 'http-authentications/http-authentication';
	export class HttpAuthenticationFactory {
	    create(component: any): HttpAuthentication;
	}

}
declare module 'object-parser/csv-object-parser' {
	import { ObjectParser } from 'object-parser/object-parser';
	import { MainInstance } from 'plugins/main-instance';
	export class CsvObjectParser implements ObjectParser {
	    parse(text: string, query?: any): object;
	    stringify(value: any, query?: any): string;
	    private parseQuery;
	    private stringifyWithHeader;
	    private parseWithHeader;
	}
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'object-parser/file-object-parser' {
	import { ObjectParser } from 'object-parser/object-parser';
	import { MainInstance } from 'plugins/main-instance';
	export class FileObjectParserTest implements ObjectParser {
	    parse(value: string): object;
	}
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'object-parser/json-object-parser' {
	import { ObjectParser } from 'object-parser/object-parser';
	import { MainInstance } from 'plugins/main-instance';
	export class JsonObjectParser implements ObjectParser {
	    parse(value: string): object;
	    stringify(value: object, query?: any): string;
	    private parseQuery;
	}
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'outputs/formatters/console-formatter' {
	import { ReportFormatter } from 'outputs/formatters/report-formatter';
	import { RequisitionModel } from 'models/outputs/requisition-model';
	import { MainInstance } from 'plugins/main-instance';
	export class ConsoleFormatter implements ReportFormatter {
	    format(report: RequisitionModel): string;
	}
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'outputs/formatters/yml-formatter' {
	import { ReportFormatter } from 'outputs/formatters/report-formatter';
	import { RequisitionModel } from 'models/outputs/requisition-model';
	import { MainInstance } from 'plugins/main-instance';
	export class YmlReportFormatter implements ReportFormatter {
	    format(report: RequisitionModel): string;
	}
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'pools/http-container' {
	export class HttpContainer {
	    private readonly port;
	    private readonly app;
	    private server;
	    private counter;
	    private sockets;
	    constructor(port: number, secure: boolean, credentials?: any);
	    acquire(): Promise<any>;
	    release(onClose: () => void): void;
	    private handleNewSocketConnections;
	    private createServer;
	    private createApp;
	}

}
declare module 'pools/http-container-pool' {
	export class HttpContainerPool {
	    private static instance;
	    private containers;
	    static getApp(port: number, secure?: boolean, credentials?: any): Promise<any>;
	    static releaseApp(port: number): Promise<void>;
	    private static getInstance;
	}

}
declare module 'pools/http-requester' {
	export class HttpRequester {
	    private readonly url;
	    private readonly method;
	    private readonly headers;
	    private readonly timeout;
	    private body;
	    constructor(url: string, method: string, headers: any, body: any, timeout?: number);
	    request(): Promise<any>;
	    private createOptions;
	    private setContentLength;
	    private handleObjectPayload;
	}

}
declare module 'publishers/custom-publisher' {
	import { MainInstance } from 'plugins/main-instance';
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'publishers/file-publisher' {
	import { MainInstance } from 'plugins/main-instance';
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'publishers/http-publisher' {
	import { MainInstance } from 'plugins/main-instance';
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'publishers/standard-output-publisher' {
	import { MainInstance } from 'plugins/main-instance';
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'publishers/stream-publisher' {
	import { MainInstance } from 'plugins/main-instance';
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'publishers/udp-publisher' {
	import { MainInstance } from 'plugins/main-instance';
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'strings/string-random-creator' {
	export class StringRandomCreator {
	    private possible;
	    constructor(possible?: string);
	    create: (length: number) => string;
	}

}
declare module 'subscriptions/custom-subscription' {
	import { MainInstance } from 'plugins/main-instance';
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'subscriptions/filename-watcher-subscription' {
	import { MainInstance } from 'plugins/main-instance';
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'subscriptions/http-subscription' {
	import { MainInstance } from 'plugins/main-instance';
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'subscriptions/standard-input-subscription' {
	import { MainInstance } from 'plugins/main-instance';
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'subscriptions/stream-subscription' {
	import { Subscription } from 'subscriptions/subscription';
	import { SubscriptionModel } from 'models/inputs/subscription-model';
	import { MainInstance } from 'plugins/main-instance';
	export class StreamSubscription extends Subscription {
	    private server;
	    private stream;
	    constructor(subscriptionAttributes: SubscriptionModel);
	    receiveMessage(): Promise<any>;
	    private gotConnection;
	    subscribe(): Promise<void>;
	    unsubscribe(): Promise<void>;
	    sendResponse(): Promise<void>;
	    private reuseServer;
	    private createServer;
	    private createStream;
	    private createSslConnection;
	    private sendGreeting;
	    private tryToLoadStream;
	    private waitForData;
	    private onEnd;
	    private onData;
	    private persistStream;
	}
	export function entryPoint(mainInstance: MainInstance): void;

}
declare module 'subscriptions/udp-subscription' {
	import { MainInstance } from 'plugins/main-instance';
	export function entryPoint(mainInstance: MainInstance): void;

}
