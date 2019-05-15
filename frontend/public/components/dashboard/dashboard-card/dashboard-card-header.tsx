import * as React from 'react';
import classNames from 'classnames';
import { CardHeader } from '@patternfly/react-core';

export class DashboardCardHeader extends React.PureComponent<DashboardCardHeaderProps> {
  render() {
    const { className, children, ...props } = this.props;
    return (
      <CardHeader {...props} className={classNames('co-dashboard-card-header', className)}>
        {children}
      </CardHeader>
    );
  }
}

export type DashboardCardHeaderProps = {
  className?: string,
  children: React.ReactNode,
}
