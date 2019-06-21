import * as React from 'react';
import { EventStream } from '../../events';

export const EventsBody: React.FC<{}> = () => (
  <div className="co-events-card__body" id="events-body">
    <EventStream scrollableElementId="events-body" namespace={undefined} showStatus={false} />
  </div>
);
