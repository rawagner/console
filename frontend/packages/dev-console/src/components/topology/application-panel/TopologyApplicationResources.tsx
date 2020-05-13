import * as React from 'react';
import * as classNames from 'classnames';
import * as _ from 'lodash';
import { modelFor } from '@console/internal/module/k8s/k8s-models';
import { TopologyDataObject } from '../topology-types';
import { getTopologyResourceObject } from '../topology-utils';
import ApplicationGroupResource from './ApplicationGroupResource';

import './TopologyApplicationResources.scss';

export type TopologyApplicationResourcesProps = {
  resources: TopologyDataObject[];
  group: string;
};

const TopologyApplicationResources: React.FC<TopologyApplicationResourcesProps> = ({
  resources,
  group,
}) => {
  const resourcesData = resources.reduce((acc, currVal) => {
    const resource = getTopologyResourceObject(currVal);
    acc[resource.kind] = [...(acc[resource.kind] ? acc[resource.kind] : []), resource];
    return acc;
  }, {});

  return (
    <>
      <ul
        className={classNames(
          'co-m-horizontal-nav__menu',
          'co-m-horizontal-nav__menu--within-sidebar',
          'co-m-horizontal-nav__menu--within-overview-sidebar',
          'odc-application-resource-tab',
        )}
      >
        <li className="co-m-horizontal-nav__menu-item">
          <button type="button">Resources</button>
        </li>
      </ul>
      {_.map(_.keys(resourcesData), (key) => (
        <ApplicationGroupResource
          key={`${group}-${key}`}
          title={modelFor(key) ? modelFor(key).label : key}
          resourcesData={resourcesData[key]}
          group={group}
        />
      ))}
    </>
  );
};

export default TopologyApplicationResources;
