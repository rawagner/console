import * as React from 'react';
import DashboardCard from '@console/shared/src/components/dashboard/dashboard-card/DashboardCard';
import DashboardCardHeader from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardHeader';
import DashboardCardTitle from '@console/shared/src/components/dashboard/dashboard-card/DashboardCardTitle';
import UtilizationBody from '@console/shared/src/components/dashboard/utilization-card/UtilizationBody';
import {
  useMetricDuration,
  Duration,
} from '@console/shared/src/components/dashboard/duration-hook';
import { Dropdown } from '@console/internal/components/utils/dropdown';
import {
  humanizeCpuCores,
  humanizeBinaryBytes,
  humanizeNumber,
} from '@console/internal/components/utils';
import { ByteDataTypes } from '@console/shared/src/graph-helper/data-utils';
import { PrometheusUtilizationItem } from '@console/internal/components/dashboard/dashboards-page/cluster-dashboard/utilization-card';

const UtilizationCard: React.FC = () => {
  const [timestamps, setTimestamps] = React.useState<Date[]>();
  const [duration, setDuration] = useMetricDuration();
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>Utilization</DashboardCardTitle>
        <Dropdown items={Duration} onChange={setDuration} selectedKey={duration} title={duration} />
      </DashboardCardHeader>
      <UtilizationBody timestamps={timestamps}>
        <PrometheusUtilizationItem
          title="CPU"
          humanizeValue={humanizeCpuCores}
          utilizationQuery=""
          duration={duration}
          setTimestamps={setTimestamps}
        />
        <PrometheusUtilizationItem
          title="Memory"
          humanizeValue={humanizeBinaryBytes}
          utilizationQuery=""
          byteDataType={ByteDataTypes.BinaryBytes}
          duration={duration}
        />
        <PrometheusUtilizationItem
          title="Filesystem"
          humanizeValue={humanizeBinaryBytes}
          utilizationQuery=""
          byteDataType={ByteDataTypes.BinaryBytes}
          duration={duration}
        />
        <PrometheusUtilizationItem
          title="Pod count"
          humanizeValue={humanizeNumber}
          utilizationQuery=""
          duration={duration}
        />
      </UtilizationBody>
    </DashboardCard>
  );
};

export default UtilizationCard;
