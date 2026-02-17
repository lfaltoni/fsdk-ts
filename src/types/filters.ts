// Filter types — shared contract for listing filter UIs across all verticals
//
// These types define the schema for filter options (what filters to show)
// and active filter state (what's currently selected). The UI component
// that renders these is per-website; the types are the reusable part.

export interface CheckboxFilterOption {
  label: string;
  name: string;
  tabUIType: 'checkbox';
  options: {
    name: string;
    value?: string;
    description?: string;
    defaultChecked?: boolean;
  }[];
}

export interface PriceRangeFilterOption {
  name: string;
  label: string;
  tabUIType: 'price-range';
  min: number;
  max: number;
}

export interface SelectNumberFilterOption {
  name: string;
  label: string;
  tabUIType: 'select-number';
  options: {
    name: string;
    max: number;
  }[];
}

/** Union of all filter option types. Used to define a filter schema. */
export type FilterOption =
  | CheckboxFilterOption
  | PriceRangeFilterOption
  | SelectNumberFilterOption;

/** Active filter state — maps filter names to selected values. */
export type ActiveFilters = Record<string, string[]>;
