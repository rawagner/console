import * as React from 'react';
import classNames from 'classnames';

export const DashboardBody: React.FC<DashboardBodyProps> = ({ className, children }) => (
  <div className={classNames('co-dashboard-body', className)}>{children}</div>
);

export type DashboardBodyProps = {
  className?: string,
  children: React.ReactNode;
};
