# Tab Auditor

This addon is designed to deal with the author's terrible ADD-fueled tab accretion.

Basically, what this does is allow a user to select a group of tabs whose URI or title match a regex, and either close them or contiguously group them in the tab bar.

# Current Features

## Filtering

It is possible to filter the list of tabs. This filter is applied to across the concatenated title and URL of each tab.

There are two modes of operation:

1. space-delimited tokenized whitelist filter. This is the default - tabs containing all of the specified tokens in any order, `*` is `.*`, most regex metachars are literalized.  A leading `^` character serves as an inverted filter (i.e. anything with that token will NOT match, e.g. `things ^stuff` means "any tab with things that doesn't have stuff")
2. raw regex filter.  Full JS regex syntax support, `.*` is `.*` 

## Kill per tab

There is a button per tab to kill tab.

## Bulk Actions

- Kill all filtered tabs (.* for all tabs)
- Collect filtered tabs into new window
- Deduplicate (by URI) the filtered tabs or all tabs if no filter

# To Implement

## Basic interface
- Some sort of list of candidates - possibly dual-window mode (MC-style) or checkboxes and checked items are sticky despite filter?
- Preview (using thumbs?) for tab on button or mouseover
- button on candidate to go to tab

## Filtering
- Time:Initial open
- Time:Last view (feasible?)

## Saved filters
- Provide some mechanism for constructing and saving filters.

## Bulk Actions
- Contiguous grouping in same window (i.e. move group to end)
- sort by depth in routing hierarchy? (e.g. [www.e.com, www.e.com/one-thing, www.e.com/one/two])

## Known Issues
- Moving auditor tabs between windows via dragging tab from tabbar to tabbar breaks connection between backend and frontend. Sigh.
