import * as React from 'react';
import classNames from 'classnames';

export class DashboardCardTitle extends React.PureComponent<DashboardCardTitleProps> {
  render() {
    const { className, children } = this.props;
    return (
      <h2 className={classNames('co-dashboard-card-title', className)}>
        {children}
      </h2>
    );
  }
}

export type DashboardCardTitleProps = {
  className?: string,
  children: React.ReactNode,
}
