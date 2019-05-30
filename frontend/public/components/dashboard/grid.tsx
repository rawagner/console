import * as React from 'react';
import * as _ from 'lodash-es';
import Measure from 'react-measure';
import { Grid, GridItem } from '@patternfly/react-core';

export const MEDIA_QUERY_LG = 992;

export const DashboardGrid: React.FC<DashboardGridProps> = ({ mainCards, leftCards, rightCards }) => {
  const [dimensions, setDimensions] = React.useState({});
  let grid;
  if (_.get(dimensions, 'bounds.width', -1) <= MEDIA_QUERY_LG) {
    grid = (
      <Grid>
        <GridItem lg={12} md={12} sm={12}>
          {mainCards}
        </GridItem>
        <GridItem key="left" lg={12} md={12} sm={12}>
          {leftCards}
        </GridItem>
        <GridItem key="right" lg={12} md={12} sm={12}>
          {rightCards}
        </GridItem>
      </Grid>
    );
  } else {
    grid = (
      <Grid>
        <GridItem key="left" lg={3} md={3} sm={3}>
          {leftCards}
        </GridItem>
        <GridItem lg={6} md={6} sm={6}>
          {mainCards}
        </GridItem>
        <GridItem key="right" lg={3} md={3} sm={3}>
          {rightCards}
        </GridItem>
      </Grid>
    );
  }
  return (
    <Measure bounds onResize={setDimensions}>
      {({ measureRef }) => (
        <div ref={measureRef}>
          {grid}
        </div>
      )}
    </Measure>
  );
};

type DashboardGridProps = {
  mainCards?: React.ReactNode,
  leftCards?: React.ReactNode,
  rightCards?: React.ReactNode,
};
