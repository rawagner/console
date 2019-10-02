import * as React from 'react';
import {
  EmptyState,
  EmptyStateVariant,
  EmptyStateIcon,
  EmptyStateBody,
} from '@patternfly/react-core';
import { CheckCircleIcon, QuestionIcon } from '@patternfly/react-icons';

export const AlertsBody = ({ isLoading, error, children }) => {
  let body: React.ReactNode;
  if (error) {
    body = (
      <EmptyState variant={EmptyStateVariant.full} className="co-status-card__alerts-msg">
        <EmptyStateIcon icon={QuestionIcon} />
        <EmptyStateBody>Alerts could not be loaded.</EmptyStateBody>
      </EmptyState>
    );
  } else if (isLoading) {
    body = (
      <div className="co-status-card__alerts-body--loading">
        <div className="skeleton-alerts" />
      </div>
    );
  } else if (!children || children.length === 0) {
    body = (
      <EmptyState variant={EmptyStateVariant.full} className="co-status-card__alerts-msg">
        <EmptyStateIcon icon={CheckCircleIcon} />
        <EmptyStateBody>No cluster alerts or messages</EmptyStateBody>
      </EmptyState>
    );
  }
  return (
    <div className="co-dashboard-card__body--no-padding co-status-card__alerts-body">
      {body || children}
    </div>
  );
};
