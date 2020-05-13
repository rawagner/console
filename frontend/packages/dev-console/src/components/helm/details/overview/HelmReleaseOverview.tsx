import * as React from 'react';
import { K8sResourceKind } from '@console/internal/module/k8s/types';
import { ResourceSummary } from '@console/internal/components/utils/details-page';
import { SectionHeading } from '@console/internal/components/utils/headings';
import { HelmRelease } from '../../helm-types';
import HelmChartSummary from './HelmChartSummary';

export interface HelmReleaseOverviewProps {
  obj: K8sResourceKind;
  customData: HelmRelease;
}

const HelmReleaseOverview: React.FC<HelmReleaseOverviewProps> = ({ obj, customData }) => {
  return (
    <div className="co-m-pane__body">
      <SectionHeading text="Helm Release Details" />
      <div className="row">
        <div className="col-sm-6">
          <ResourceSummary resource={obj} customPathName={'metadata.labels.name'} />
        </div>
        <div className="col-sm-6">
          <HelmChartSummary helmRelease={customData} obj={obj} />
        </div>
      </div>
    </div>
  );
};

export default HelmReleaseOverview;
