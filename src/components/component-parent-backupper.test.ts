import { ComponentParentBackupper } from './component-parent-backupper';

describe('ComponentParentBackupper', () => {
  it('should remove parents', () => {
    const requisition: any = {
      name: 'requisition'
    };
    const child = {
      name: 'publisher',
      parent: requisition
    };
    const publisher = {
      name: 'publisher',
      parent: requisition
    };
    const subscription = {
      name: 'subscription',
      parent: requisition
    };

    requisition.requisitions = [child];
    requisition.publishers = [publisher];
    requisition.subscriptions = [subscription];

    new ComponentParentBackupper().removeParents(requisition);

    expect(requisition.requisitions[0].parent).toBeUndefined();
    expect(requisition.publishers[0].parent).toBeUndefined();
    expect(requisition.subscriptions[0].parent).toBeUndefined();
  });

  it('should put parents back', () => {
    const requisition: any = {
      name: 'requisition',
      id: 'requisition'
    };
    const child = {
      name: 'child',
      id: 'child',
      parent: requisition
    };
    const publisher = {
      name: 'publisher',
      id: 'publisher',
      parent: requisition
    };
    const subscription = {
      name: 'subscription',
      id: 'subscription',
      parent: requisition
    };
    requisition.requisitions = [child];
    requisition.publishers = [publisher];
    requisition.subscriptions = [subscription];

    const componentParentBackupper = new ComponentParentBackupper();
    componentParentBackupper.removeParents(requisition);
    componentParentBackupper.putParentsBack(requisition);

    expect(requisition.requisitions[0].parent.name).toBe(requisition.name);
    expect(requisition.publishers[0].parent.name).toBe(requisition.name);
    expect(requisition.subscriptions[0].parent.name).toBe(requisition.name);
  });
});
