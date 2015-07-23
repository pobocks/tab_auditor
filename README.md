# Tab Auditor

This addon is designed to deal with the author's terrible ADD-fueled tab accretion.

Basically, what this does is allow a user to select a group of tabs whose URI or title match a regex, and either close them or contiguously group them in the tab bar.

# Current Features

## Filtering

It is possible to filter a the list of tabs.  This is naively implemented - it's just "feed me a regex", then that regex is applied to the concatenated title and URL.

## Kill per tab

There is a button per tab to kill tab.

## Bulk Actions

- Kill all filtered tabs (.* for all tabs)
- Collect filtered tabs into new window
- Deduplicate (by URI) the filtered tabs or all tabs if no filter

# To Implement

## Basic interface
- Some sort of list of candidates - possibly dual-window mode (MC-style) or checkboxes and checked items are sticky despite filter?

## Filtering
- Token-based filter (i.e. by concatting space-sep tokens as zero-width assertions)
- Time:Initial open
- Time:Last view (feasible?)

## Bulk Actions
- Contiguous grouping in same window (i.e. move group to end)
- sort by depth in routing hierarchy? (e.g. [www.e.com, www.e.com/one-thing, www.e.com/one/two])
