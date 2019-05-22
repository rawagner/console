import * as React from 'react';
import classNames from 'classnames';
import { Card, CardProps } from '@patternfly/react-core';

export class DashboardCard extends React.PureComponent<DashboardCardProps> {
  render() {
    const { className, children, ...props } = this.props;
    return (
      <Card {...props} className={classNames('co-dashboard-card', className)}>
        {children}
      </Card>
    );
  }
}

type DashboardCardProps = {
  className?: string;
  children: React.ReactNode;
} & CardProps;
