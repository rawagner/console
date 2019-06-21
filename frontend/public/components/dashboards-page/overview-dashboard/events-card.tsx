import * as React from 'react';
import { DashboardCard, DashboardCardHeader, DashboardCardBody, DashboardCardTitle } from '../../dashboard/dashboard-card';
import { EventsBody } from '../../dashboard/events-card/events-body';

export const EventsCard: React.FC<{}> = () => (
  <DashboardCard>
    <DashboardCardHeader>
      <DashboardCardTitle>Events</DashboardCardTitle>
    </DashboardCardHeader>
    <DashboardCardBody className="co-overview-events__body">
      <EventsBody />
    </DashboardCardBody>
  </DashboardCard>
);
