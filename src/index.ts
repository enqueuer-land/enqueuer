import {RequisitionReader} from "./reader/requisition-reader";
import {FolderRequisitionReader} from "./reader/folder-requisition-reader";
import {StandardInputReader} from "./reader/standard-input-reader";
import {UdsReader} from "./reader/uds-reader";
import {EnqueuerStarter} from "./reader/enqueuer-starter";


//Multi-injection from inversify
let requisitionReaders: RequisitionReader[] = [];

requisitionReaders.push(new FolderRequisitionReader());
requisitionReaders.push(new StandardInputReader());
requisitionReaders.push(new UdsReader());

new EnqueuerStarter().start(requisitionReaders);