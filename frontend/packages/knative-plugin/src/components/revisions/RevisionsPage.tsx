import * as React from 'react';
import { ListPage } from '@console/internal/components/factory/list-page';
import { referenceForModel } from '@console/internal/module/k8s/k8s';
import { RevisionModel } from '../../models';
import RevisionList from './RevisionList';

const RevisionsPage: React.FC<React.ComponentProps<typeof ListPage>> = (props) => (
  <ListPage
    {...props}
    canCreate={false}
    kind={referenceForModel(RevisionModel)}
    ListComponent={RevisionList}
  />
);

export default RevisionsPage;
