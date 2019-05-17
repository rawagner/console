import * as React from 'react';
import Measure from 'react-measure';
import { Grid, GridItem } from '@patternfly/react-core';

import { Dashboard } from '../../dashboard';
import { HealthCard } from './health-card';

export const MEDIA_QUERY_LG = 990;

export class OverviewDashboard extends React.Component<{}> {
  state = {
    dimensions: {
      width: -1,
    },
  };

  onResize = contentRect => {
    this.setState({ dimensions: contentRect.bounds });
  };

  render() {
    const { width } = this.state.dimensions;
    let grid;
    if (width <= MEDIA_QUERY_LG) {
      grid = (
        <Grid>
          <GridItem lg={12} md={12} sm={12}>
            <HealthCard />
          </GridItem>
          <GridItem key="left" lg={12} md={12} sm={12}>
            {/* left cards */}
          </GridItem>
          <GridItem key="right" lg={12} md={12} sm={12}>
            {/* right cards */}
          </GridItem>
        </Grid>
      );
    } else {
      grid = (
        <Grid>
          <GridItem key="left" lg={3} md={3} sm={3}>
            {/* left cards */}
          </GridItem>
          <GridItem lg={6} md={6} sm={6}>
            <HealthCard />
          </GridItem>
          <GridItem key="right" lg={3} md={3} sm={3}>
            {/* right cards */}
          </GridItem>
        </Grid>
      );
    }
    return (
      <Measure bounds onResize={this.onResize}>
        {({ measureRef }) => (
          <div ref={measureRef}>
            <Dashboard>
              {grid}
            </Dashboard>
          </div>
        )}
      </Measure>
    );
  }
}
