import React, { FC, useState, useEffect } from 'react';
import { Button } from 'carbon-components-react';
import filter from 'lodash/filter';
import get from 'lodash/get';
import ListBox from 'carbon-components-react/lib/components/ListBox';
import { fieldsetClasses, labelClasses, toggleMoreClass } from './facetGroupClasses';
import {
  SelectableDynamicFacets,
  SelectableQueryTermAggregationResult,
  AggregationSettings
} from '../../utils/searchFacetInterfaces';
import { Messages } from '../../messages';
import { MultiSelectFacetsGroup } from './MultiSelectFacetsGroup';
import { SingleSelectFacetsGroup } from './SingleSelectFacetsGroup';

interface CollapsableFacetsGroupProps {
  /**
   * Facets configuration with fields and results counts
   */
  facets: (SelectableDynamicFacets | SelectableQueryTermAggregationResult)[];
  /**
   * Aggregation component settings
   */
  aggregationSettings: AggregationSettings;
  /**
   * How many facets should be shown
   */
  collapsedFacetsCount: number;
  /**
   * i18n messages for the component
   */
  messages: Messages;
  /**
   * Facet text field
   */
  facetsTextField: 'key' | 'text';
  /**
   * Callback to handle changes in selected facets
   */
  onChange: (selectedFacetField: string, selectedFacetKey: string, checked: boolean) => void;
  /**
   * Callback to reset selected facet
   */
  onClear: (field: string) => void;
}

export const CollapsableFacetsGroup: FC<CollapsableFacetsGroupProps> = ({
  facets,
  aggregationSettings,
  collapsedFacetsCount,
  facetsTextField,
  messages,
  onClear,
  onChange
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(collapsedFacetsCount < facets.length);
  const [isCollapsable, setIsCollapsable] = useState<boolean>(collapsedFacetsCount < facets.length);

  useEffect(() => {
    setIsCollapsed(collapsedFacetsCount < facets.length);
    setIsCollapsable(collapsedFacetsCount < facets.length);
  }, [collapsedFacetsCount]);

  const toggleFacetsCollapse = (): void => {
    setIsCollapsed(!isCollapsed);
  };

  const areMultiSelectionsAllowed = aggregationSettings.multiple_selections_allowed;
  const facetsLabel = aggregationSettings.label || aggregationSettings.field;
  const collapsedFacets = isCollapsed ? facets.slice(0, collapsedFacetsCount) : facets;
  const selectedFacets = filter(facets, ['selected', true]);
  const selectedFacetText = get(selectedFacets[0], facetsTextField, '');
  const shouldDisplayAsMultiSelect = areMultiSelectionsAllowed || selectedFacets.length > 1;
  const shouldDisplayClearButton = shouldDisplayAsMultiSelect && selectedFacets.length > 0;
  const handleClearFacets = (): void => {
    onClear(aggregationSettings.field);
  };

  const translateWithId = (id: string): string => {
    const mapping = {
      'clear.all': messages.clearFacetTitle,
      'clear.selection': messages.clearFacetSelectionTitle
    };
    return mapping[id];
  };

  return (
    <fieldset className={fieldsetClasses.join(' ')}>
      <legend className={labelClasses.join(' ')}>
        {facetsLabel}
        {shouldDisplayClearButton && (
          <ListBox.Selection
            clearSelection={handleClearFacets}
            selectionCount={selectedFacets.length}
            translateWithId={translateWithId}
          />
        )}
      </legend>
      {shouldDisplayAsMultiSelect ? (
        <MultiSelectFacetsGroup
          facets={collapsedFacets}
          aggregationSettings={aggregationSettings}
          onChange={onChange}
          facetsTextField={facetsTextField}
        />
      ) : (
        <SingleSelectFacetsGroup
          facets={collapsedFacets}
          aggregationSettings={aggregationSettings}
          onChange={onChange}
          selectedFacet={selectedFacetText}
          facetsTextField={facetsTextField}
        />
      )}
      {isCollapsable && (
        <Button
          className={toggleMoreClass}
          kind="ghost"
          size="small"
          onClick={toggleFacetsCollapse}
        >
          {isCollapsed ? messages.collapsedFacetShowMoreText : messages.collapsedFacetShowLessText}
        </Button>
      )}
    </fieldset>
  );
};