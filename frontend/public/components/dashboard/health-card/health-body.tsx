import * as React from 'react';
import classNames from 'classnames';

export class HealthBody extends React.PureComponent<HealthBodyProps> {
  render() {
    const { children, className } = this.props;
    return <div className={classNames('co-health-card-body', className)}>{children}</div>;
  }
}

type HealthBodyProps = {
  className?: string,
  children: any,
};
