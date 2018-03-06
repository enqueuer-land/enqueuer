import {Enqueuer} from "./runner/enqueuer";
import {Configuration} from "./conf/configuration";

new Enqueuer().execute(Configuration.getReaders());
