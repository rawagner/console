import * as React from 'react';
import { VirtualTableBody } from '@patternfly/react-virtualized-extension';
import { CellMeasurerCache, CellMeasurer } from 'react-virtualized';
import { Scroll } from '@patternfly/react-virtualized-extension/dist/js/components/Virtualized/types';
import { TableColumn, RowProps } from './VirtualizedTable';

type VirtualizedTableBodyProps<D = any> = {
  Row: React.ComponentType<RowProps<D>>;
  data: D[];
  height: number;
  isScrolling: boolean;
  onChildScroll: (params: Scroll) => void;
  columns: TableColumn<D>[];
  scrollTop: number;
  width: number;
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
}) => {
  const cellMeasurementCache = new CellMeasurerCache({
    fixedWidth: true,
    minHeight: 44,
    keyMapper: (rowIndex) => data?.[rowIndex]?.metadata?.uid || rowIndex, // TODO custom keyMapper ?
  });

  const rowRenderer = ({ index, isScrolling: scrolling, isVisible, key, style, parent }) => {
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
  };

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
    />
  );
};

export default VirtualizedTableBody;
