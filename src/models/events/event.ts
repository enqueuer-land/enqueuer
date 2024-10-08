import { Assertion } from './assertion';

export enum DefaultHookEvents {
  ON_INIT = 'onInit',
  ON_FINISH = 'onFinish'
}

export interface Event {
  debug?: boolean;
  script?: string;
  assertions?: Assertion[];
  store?: { [propName: string]: any };
}
