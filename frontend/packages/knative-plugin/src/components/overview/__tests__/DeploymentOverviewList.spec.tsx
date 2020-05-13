import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import {
  sampleKnativeReplicaSets,
  sampleKnativePods,
} from '@console/dev-console/src/components/topology/__tests__/topology-knative-test-data';
import DeploymentOverviewList from '../DeploymentOverviewList';
import { PodControllerOverviewItem } from '@console/shared/src/types/pod';
import { SidebarSectionHeading } from '@console/internal/components/utils/headings';
import { ResourceLink } from '@console/internal/components/utils/resource-link';

type DeploymentOverviewListProps = React.ComponentProps<typeof DeploymentOverviewList>;
let current: PodControllerOverviewItem;
describe('DeploymentOverviewList', () => {
  let wrapper: ShallowWrapper<DeploymentOverviewListProps>;
  beforeEach(() => {
    current = {
      alerts: {},
      revision: 1,
      obj: sampleKnativeReplicaSets.data[0],
      pods: sampleKnativePods.data,
    };
  });
  it('should render DeploymentOverviewList with ResourceLink', () => {
    wrapper = shallow(<DeploymentOverviewList current={current} />);
    expect(wrapper.find(SidebarSectionHeading)).toHaveLength(1);
    expect(wrapper.find(ResourceLink)).toHaveLength(1);
  });
});
