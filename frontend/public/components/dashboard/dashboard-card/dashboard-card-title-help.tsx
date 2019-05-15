import * as React from 'react';
import { Button, Icon, OverlayTrigger, Popover } from 'patternfly-react';

export class DashboardCardTitleHelp extends React.PureComponent<DashboardCardTitleHelpProps> {
  render() {
    const { children } = this.props;
    if (React.Children.count(children) === 0) {
      return null;
    }
    const overlay = <Popover id="popover">{children}</Popover>;
    return (
      <OverlayTrigger overlay={overlay} placement="top" trigger={['click']} rootClose>
        <Button bsStyle="link">
          <Icon
            type="fa"
            name="info-circle"
            className="co-dashboard__icon-sm co-dashboard-header-icon--info"
          />
        </Button>
      </OverlayTrigger>
    );
  }
}

export type DashboardCardTitleHelpProps = {
  children: React.ReactNode,
}
