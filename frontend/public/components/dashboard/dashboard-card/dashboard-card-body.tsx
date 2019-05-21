import * as React from 'react';
import classNames from 'classnames';
import { CardBody } from '@patternfly/react-core';

import { LoadingInline } from '../../utils';

export class DashboardCardBody extends React.PureComponent<DashboardCardBodyProps> {
  render() {
    const { isLoading, classname, children, ...props } = this.props;
    return (
      <CardBody className={classNames('co-dashboard-card-body', classname)} {...props}>
        {isLoading ? <LoadingInline /> : children}
      </CardBody>
    );
  }
}

type DashboardCardBodyProps = {
  classname?: string;
  children: React.ReactNode;
  isLoading?: boolean;
};
