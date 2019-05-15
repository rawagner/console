import * as React from 'react';

export const Dashboard: React.FC<DashboardProps> = ({ children }) => <div>{children}</div>;

export type DashboardProps = {
  children: React.ReactNode;
};
