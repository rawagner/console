import * as React from 'react';
import { Button, OverlayTrigger, Popover } from 'patternfly-react';

const SEE_ALL = 'See all';

export class DashboardCardTitleSeeAll extends React.PureComponent<DashboardCardTitleSeeAllProps> {
  render() {
    const { title, children } = this.props;
    if (React.Children.count(children) === 0) {
      return null;
    }
    const overlay = (
      <Popover id="popover" title={title}>
        {children}
      </Popover>
    );
    return (
      <OverlayTrigger overlay={overlay} placement="right" trigger={['click']} rootClose>
        <Button bsStyle="link">{SEE_ALL}</Button>
      </OverlayTrigger>
    );
  }
}

type DashboardCardTitleSeeAllProps = {
  children?: React.ReactNode;
  title: string;
}
