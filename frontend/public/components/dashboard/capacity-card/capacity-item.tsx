import * as React from 'react';
import * as _ from 'lodash-es';
import { ChartDonut, ChartThemeColor, ChartThemeVariant, ChartTooltip } from '@patternfly/react-charts';

import { USED, AVAILABLE, LOADING, CAPACITY, UNKNOWN, NOT_AVAILABLE } from './strings';
import { LoadingInline, round } from '../../utils';

export const CapacityItem: React.FC<CapacityItemProps> = React.memo(({ title, used, total, formatValue, isLoading = false }) => {
  let description;
  let data = [{ x: USED, y: 0, label: null }, { x: AVAILABLE, y: 100, label: null }];
  let primaryTitle;
  let secondaryTitle = CAPACITY;
  if (isLoading) {
    description = <LoadingInline />;
    primaryTitle = LOADING;
  } else if (used == null || total == null) {
    description = NOT_AVAILABLE;
    primaryTitle = UNKNOWN;
  } else {
    const totalFormatted = formatValue(total);
    const usedFormatted = formatValue(used, totalFormatted.unit);

    const availableValue = round(totalFormatted.value - usedFormatted.value);
    const available = {
      value: availableValue,
      string: totalFormatted.space ? `${availableValue} ${totalFormatted.unit}` : availableValue+totalFormatted.unit,
    };
    const percentageUsed = total > 0 ? Math.round((100 * usedFormatted.value) / totalFormatted.value) : 0;

    data = [
      {
        x: USED,
        y: usedFormatted.value,
        label: `${USED}: ${usedFormatted.string}`,
      },
      {
        x: AVAILABLE,
        y: available.value,
        label: `${AVAILABLE}: ${available.string}`,
      },
    ];
    description = `${available.string} available out of ${totalFormatted.string}`;
    primaryTitle = `${percentageUsed.toString()}%`;
    secondaryTitle = USED;
  }
  return (
    <div className="co-capacity-card__item">
      <div className="co-capacity-card__item-title">{title}</div>
      <h6 className="co-capacity-card__item-description">{description}</h6>
      <div id={_.uniqueId('donut-chart-')} className="co-capacity-card__item-graph">
        <ChartDonut
          title={primaryTitle}
          subTitle={secondaryTitle}
          data={data}
          labels={datum => datum.label}
          height={200}
          width={200}
          themeColor={ChartThemeColor.blue}
          themeVariant={ChartThemeVariant.light}
          labelComponent={<ChartTooltip style={{ fontSize: 20 }} />}
        />
      </div>
    </div>
  );
});

type CapacityItemProps = {
  title: string;
  used?: number;
  total?: number;
  formatValue: any,
  isLoading: boolean;
};
