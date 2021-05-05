import * as React from 'react';
import * as _ from 'lodash';

import { FilterToolbar } from '../../filter-toolbar';
import { ListPageFilterProps } from '@console/dynamic-plugin-sdk/src/api/api-types';

const ListPageFilter: React.FC<ListPageFilterProps> = ({
  data,
  loaded,
  rowFilters,
  nameFilterPlaceholder,
  labelFilterPlaceholder,
  textFilter,
  hideNameLabelFilters,
  hideLabelFilter,
  columnLayout,
  onFilterChange,
}) => {
  return (
    loaded &&
    !_.isEmpty(data) && (
      <FilterToolbar
        rowFilters={rowFilters}
        data={data}
        nameFilterPlaceholder={nameFilterPlaceholder}
        labelFilterPlaceholder={labelFilterPlaceholder}
        onFilterChange={onFilterChange}
        textFilter={textFilter}
        hideNameLabelFilters={hideNameLabelFilters}
        hideLabelFilter={hideLabelFilter}
        columnLayout={columnLayout}
      />
    )
  );
};

export default ListPageFilter;
