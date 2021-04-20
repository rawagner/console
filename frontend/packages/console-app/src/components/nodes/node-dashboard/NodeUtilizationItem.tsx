import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  trimSecondsXMutator,
  UtilizationItemProps,
  LIMIT_STATE,
} from '@console/shared/src/components/dashboard/utilization-card/UtilizationItem';
import { mapLimitsRequests } from '@console/internal/components/graphs/utils';
import {
  AreaChart,
  AreaChartStatus,
  chartStatusColors,
} from '@console/internal/components/graphs/area';
import {
  ColoredIconProps,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@console/shared/src';

const NodeUtilizationItem: React.FC<UtilizationItemProps> = ({
  title,
  utilization,
  humanizeValue,
  isLoading = false,
  query,
  error,
  max = null,
  TopConsumerPopover,
  byteDataType,
  limit,
  requested,
  setLimitReqState,
  setTimestamps,
}) => {
  const { t } = useTranslation();
  const { data, chartStyle } = mapLimitsRequests(
    utilization,
    limit,
    requested,
    trimSecondsXMutator,
  );
  const [utilizationData, limitData, requestedData] = data;
  setTimestamps &&
    utilizationData &&
    setTimestamps(utilizationData.map((datum) => datum.x as Date));
  const current = utilizationData?.length ? utilizationData[utilizationData.length - 1].y : null;

  let humanMax: string;
  let humanAvailable: string;
  if (current && max) {
    humanMax = humanizeValue(max).string;
    const percentage = (100 * current) / max;

    if (percentage >= 90) {
      chartStyle[0] = { data: { fill: chartStatusColors[AreaChartStatus.ERROR] } };
    } else if (percentage >= 80) {
      chartStyle[0] = { data: { fill: chartStatusColors[AreaChartStatus.WARNING] } };
    }

    humanAvailable = humanizeValue(max - current).string;
  }

  const chart = (
    <AreaChart
      ariaChartLinkLabel={t('dashboard~View {{title}} metrics in query browser', {
        title,
      })}
      ariaChartTitle={title}
      data={data}
      loading={!error && isLoading}
      query={query}
      xAxis={false}
      humanize={humanizeValue}
      padding={{ top: 13, left: 70, bottom: 0, right: 0 }}
      height={70}
      chartStyle={chartStyle}
      byteDataType={byteDataType}
      mainDataName="usage"
    />
  );

  let LimitIcon: React.ComponentType<ColoredIconProps>;
  let humanLimit: string;
  let limitState = LIMIT_STATE.OK;
  let requestedState = LIMIT_STATE.OK;

  const latestLimit = limitData?.length ? limitData[limitData.length - 1].y : null;
  const latestRequested = requestedData?.length ? requestedData[requestedData.length - 1].y : null;

  if (max) {
    if (latestLimit && latestRequested) {
      humanLimit = humanizeValue(latestLimit).string;
      const limitPercentage = (100 * latestLimit) / max;
      const reqPercentage = (100 * latestRequested) / max;
      if (limitPercentage > 100) {
        limitState = LIMIT_STATE.ERROR;
      } else if (limitPercentage >= 75) {
        limitState = LIMIT_STATE.WARN;
      }
      if (reqPercentage > 100) {
        requestedState = LIMIT_STATE.ERROR;
      } else if (reqPercentage >= 75) {
        requestedState = LIMIT_STATE.WARN;
      }
      if ([limitState, requestedState].includes(LIMIT_STATE.ERROR)) {
        LimitIcon = RedExclamationCircleIcon;
      } else if ([limitState, requestedState].includes(LIMIT_STATE.WARN)) {
        LimitIcon = YellowExclamationTriangleIcon;
      }
      setLimitReqState && setLimitReqState({ limit: limitState, requested: requestedState });
    }
  }

  const currentHumanized = current ? humanizeValue(current).string : null;

  return (
    <div className="co-utilization-card__item" data-test-id="utilization-item">
      <div className="co-utilization-card__item-description">
        <div className="co-utilization-card__item-section">
          <h4 className="pf-c-title pf-m-md">{title}</h4>
          {error || (!isLoading && !utilizationData?.length) ? (
            <div className="text-secondary">{t('public~Not available')}</div>
          ) : (
            <div>
              {LimitIcon && <LimitIcon className="co-utilization-card__item-icon" />}
              {TopConsumerPopover ? (
                <TopConsumerPopover
                  current={currentHumanized}
                  max={humanMax}
                  limit={latestLimit ? humanizeValue(latestLimit).string : null}
                  requested={latestRequested ? humanizeValue(latestRequested).string : null}
                  available={humanAvailable}
                  total={humanMax}
                  limitState={limitState}
                  requestedState={requestedState}
                />
              ) : (
                currentHumanized
              )}
            </div>
          )}
        </div>
        {!error && (humanAvailable || humanMax) && (
          <div className="co-utilization-card__item-section">
            <span className="co-utilization-card__item-text" data-test="utilization-card-item-text">
              {humanLimit && (
                <span>
                  {t('dashboard~{{humanAvailable}} available of {{humanLimit}} total limit', {
                    humanAvailable,
                    humanLimit,
                  })}
                </span>
              )}
              {!humanLimit && humanMax && (
                <span>
                  {t('dashboard~{{humanAvailable}} available of {{humanMax}}', {
                    humanAvailable,
                    humanMax,
                  })}
                </span>
              )}
              {!humanLimit && !humanMax && (
                <span>
                  {t('dashboard~{{humanAvailable}} available', {
                    humanAvailable,
                  })}
                </span>
              )}
            </span>
          </div>
        )}
      </div>
      <div className="co-utilization-card__item-chart">{chart}</div>
    </div>
  );
};

export default NodeUtilizationItem;
