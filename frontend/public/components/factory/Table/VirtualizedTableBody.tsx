import * as React from 'react';
import { CellMeasurerCache, CellMeasurer } from 'react-virtualized';
import { Scroll } from '@patternfly/react-virtualized-extension/dist/js/components/Virtualized/types';
import { VirtualTableBody } from '@patternfly/react-virtualized-extension';

import { usePrevious } from '@console/shared/src/hooks/previous';
import { RowProps, TableColumn } from '@console/dynamic-plugin-sdk/src/api/api-types';

type VirtualizedTableBodyProps<D = any> = {
  Row: React.ComponentType<RowProps<D>>;
  data: D[];
  height: number;
  isScrolling: boolean;
  onChildScroll: (params: Scroll) => void;
  columns: TableColumn<D>[];
  scrollTop: number;
  width: number;
  sortBy: any;
};

const VirtualizedTableBody: React.FC<VirtualizedTableBodyProps> = ({
  Row,
  height,
  isScrolling,
  onChildScroll,
  data,
  columns,
  scrollTop,
  width,
  sortBy,
}) => {
  const prevWidth = usePrevious(width);
  const prevSortBy = usePrevious(sortBy);
  const cellMeasurementCache = React.useMemo(
    () =>
      new CellMeasurerCache({
        fixedWidth: true,
        minHeight: 44,
        keyMapper: (rowIndex) => data?.[rowIndex]?.metadata?.uid || rowIndex, // TODO custom keyMapper ?
      }),
    [data],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useMemo(() => cellMeasurementCache.clearAll(), [columns, width, sortBy]);

  const rowRenderer = React.useCallback(
    ({ index, isScrolling: scrolling, isVisible, key, style, parent }) => {
      const rowArgs: RowProps<any> = {
        obj: data[index],
        index,
        columns,
        isScrolling: scrolling,
        style,
      };

      // do not render non visible elements (this excludes overscan)
      if (!isVisible) {
        return null;
      }
      return (
        <CellMeasurer
          cache={cellMeasurementCache}
          columnIndex={0}
          key={key}
          parent={parent}
          rowIndex={index}
        >
          <Row key={key} {...rowArgs} />
        </CellMeasurer>
      );
    },
    [cellMeasurementCache, columns, data],
  );

  return (
    <VirtualTableBody
      autoHeight
      className="pf-c-table pf-m-compact pf-m-border-rows pf-c-virtualized pf-c-window-scroller"
      deferredMeasurementCache={cellMeasurementCache}
      rowHeight={cellMeasurementCache.rowHeight}
      height={height || 0}
      isScrolling={isScrolling}
      onScroll={onChildScroll}
      overscanRowCount={10}
      columns={columns}
      rows={data}
      rowCount={data.length}
      rowRenderer={rowRenderer}
      scrollTop={scrollTop}
      width={width}
      isScrollingOptOut={width === prevWidth && sortBy === prevSortBy}
    />
  );
};

export default VirtualizedTableBody;
