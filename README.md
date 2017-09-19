# IRIS Timelineviewer

An IRIS component for navigating and interacting with time based data. Under the hood it is a proxy for the DCJS library
that adds a few bits to the existing API and provides a more natural syntax for developers not familiar with d3. 

## Features

* Display time based data in either a bar, line or area graph.
* No restrictions on data representation - use any data structure you want.
* Navigate and interact with the data through a rich API.
* Optional self-updating data table displaying the currently selected data (experimental).
* Multiple interaction types - click-based or brush-based.
* Event and callback based approach to allow for maximumum customisation.
* Fully customizable styles via CSS.

### Browsers

This component works with the following browser versions:

* Chrome
* Firefox
* IE

### Accessibility

Charts are generally not very accessible and you should always provide an alternative way for visually impaired users to read and interact with 
any displayed data. The timelineviewer provides some help towards this goal;

* The whole dragging / clicking / selecting / reading API is available through public methods
* Hooks are provided into almost every event / lifecycle moment, allowing you to adjust your view when the timeline changes
* Experimental "DataTable" functionality is provided, allowing you to place a data table on the page that will change as your selection changes. 

### Installation

#### NPM
```
npm install iris-timeline-viewer
```

A *stylesheet* is provided, and should be included on the page;

```
<link rel="stylesheet" href="node_modules/iris-timeline-viewer/dist/style.min.css">
```

As well as the JS, which you can import in whatever way you want as it's an UMD module. The simplest way
is just to include it on the page;

```
<script type="text/javascript" src="node_modules/iris-timeline-viewer/dist/bundle.min.js"></script>
```

### Example
```
// construct a new instance
var options   = { displayNavigationStep: 'years'  };
var timeline = new IRIS.TimelineViewer(document.querySelector('#timelineContainer'), options);

// Load some data into it
var data      = [{ date: "12/01/2001", foo: "bar" }, { date: "21/02/2001", foo: "baz" }];
timeline.setData(data);

// render the timeline
timeline.render();
```
A more thorough example is available in the distribution itself (see ```dist/index.html``` or ```src/index.html```)

### Options
You can get or set the options for a timeline using the following interface;

```
timeline.getOption(<optionName>);
timeline.setOption(<optionName>, <optionValue>);
```

The options themselves are documented within the code however have been reproduced here for convinience.

```
  // Function specifying how to "count" each event. By default, each event counts as 1 on the y-axis, however
  // it might be that your data actually contains its own count (e.g. item.count) - this function should return
  // the number to count the incident as.
  dataCountHandler:       d => 1,

  // By default, timeline viewer will expect each item in the data array to have a 'date' property with the
  // date in it. If the date comes from somewhere else, override this functionality here.
  dataDateHandler:        d => d.date,

  // By default the date is assumed to be dd/mm/yyyy. Override that using this option, see dc.js docs for
  // available date formatting options.
  dataDateFormat:         '%d/%m/%Y',

  // The chart type to display. Can be either "bar", "line" or "area".
  displayChartType:       'bar',

  // The interaction type. Can be either "click" or "brush".
  displayInteractionType: 'click',

  // The height of the component.
  displayHeight:          300,

  // The width of the component.
  displayWidth:           1500,

  // The margins of the component.
  displayMargins:         {top: 10, right: 50, bottom: 30, left: 30},

  // The date to initialize the start/end of the view to. Even though your data might cover 100+ years,
  // you may want to intialize the view only looking at the 90's. Setting these dates creates a 'window'
  // just looking at the dates you specify (the other dates will be "off screen" but will still exist).
  // Setting the values to 'auto' will set the start/end to the max/min dates that the data goes to.
  displayStartDate:       'auto',
  displayEndDate:         'auto',

  // The amount of time between each "bar" or "point". Can be set to 'seconds', 'minutes', 'days', 'weeks', 'months' or 'years'
  displayScale:           'months',

  // The amount of ticks on the Y axis.
  displayTicks:           4,

  // The colours to use for the bars / lines. Note that the option being an array is purely to accomodate future development
  // where multiple lines / bars may appear on the same graph. the array's first element will be used for the colour, and can
  // be specified in any CSS-compliant way (reserved colours or hex codes).
  displayColors:             ['steelblue'],


  // The timeline allows users to skip forward and backward along the timeline using the #nextPeriod and #previousPeriod public
  // mehtods - this option defines the amount of time that should be skipped. Can be set to 'seconds', 'minutes', 'days', 'weeks', 'months' or 'years'
  displayNavigationStep: 'years',

  // If a data table is rendered, this specifies the max number of records that it should display.
  dataTableSize:          20,

  // An array of functions defining the contents of each column in the data table. For example;
  //
  // dataTableColumns: [
  //  function(d) { return d.dDate; },
  //  function(d) { return d.name; },
  //  function(d) { return d.description; }
  // ]
  //
  dataTableColumns:       null,

  // If using a data table, you can specify a grouping rule to group data together (e.g. "by year"). This defaults to just
  // grouping by nothing, however you could group by year / months / name / anything.
  dataTableGroupingRule:  d => '&nbsp;'
```

### Events
The timeline emits many events that can be subscribed to in order to provide custom behaviour. These events are subscribed to using the
following interface;

```
  timeline.on('afterSelectionRangeChanged', function() {
    console.log("The selection range changed!");
  });

  timeline.on('dataClick', function(data, items) {
    console.log("user clicked on bar ", data);
    console.log("which represents the items ", items);
  });
```

Events are as follows;

```
  // beforeRender
  // afterRender
  // beforeSetData
  // afterSetData
  // beforeSetFilter
  // afterSetFilter
  // beforeSetSelectionRange
  // afterSetSelectionRange
  // afterSelectionRangeChanged
  // beforeSetOption:{optionName} - optionName is optional and allows you to listen to only certain options changing
  // afterSetOption:{optionName}
  // beforeCreateDataTable
  // afterCreateDataTable
  // beforePreviousPeriod
  // afterPreviousPeriod
  // beforeNextPeriod
  // afterNextPeriod
  // periodChanged
  // dataBrush (only available if interactionType is 'brush')
  // dataClick (only available if interactionType is 'click')
```
The events here are mostly self explanatory and generally hook into calls to public methods. Note that `dataClick` and `dataBrush` will both
yield two arguments showing what was clicked on and what items are covered by the click.

### Public Methods

```
timeline.getData()
```
Returns the data currently represented by the timeline (does not include filtered data)

```
timeline.setData(data)
```
Sets the data that the timeline should represent. This should be an array of javascript objects. By default, the timeline
expects each of these objects to have a ```date``` property of the format ```dd/mm/yyyy```.

```
timeline.getSelectedData()
```
Gets the data currently selected by the brush (does not include filtered data)

```
timeline.render()
```
Renders the timeline. By default, nothing will re-render the timeline. This allows you to change multiple options before redrawing
it yourself (or do it automatically using the events interface).

```
timeline.setFilter(function)
```
Sets the current filter on the timeline. Takes a function that yields a data item, which should return true if the data item is to
be included. For example, if you wanted the filter to only include data items where the prority is "high", you would filter like
this: `timeline.setFilter(function(d) { return d.priority === "high"; });`

```
timeline.getFilter()
```
Accessor for getting the currently applied filter

```
timeline.clearFilter()
```
Clears the currently applied filter.

```
timeline.setSelectionRange(Date, Date)
```
Sets the currently selected data (brush) - only available if interaction type set to "brush"

```
timeline.getSelectionRange()
```
Returns the current selection range as an array where the first item is the "from" and the second item is the "to".

```
timeline.clearSelectionRange()
```
Clears the brush / selection range from the graph.

```
timeline.nextPeriod()
```
Advances the timeline's "window" to the next step (as defined by the navigationStep option). E.g. if you were looking
at the dates 1990-1995 and your step was "years", this would advance to 1991-1996.

```
timeline.previousPeriod()
```
As above, but retreats the window.

```
timeline.earliestDate()
```
Returns the earliest date represented by the timeline's data.

```
timeline.latestDate()
```
Returns the earliest date represented by the timeline's data.

```
timeline.on(eventname, callback)
```
Subscribe to a timeline event. See Events section above.

```
timeline.createDataTable(elementId)
```
Creates a data table (experimantal) that represents the data currently displayed on the timeline. The data table will automatically update
as the timeline is manipulated. The data table can be customised via the options (data table options start with the word dataTable)

```
timeline.destroy()
```
Destructor. Removes the timeline from the page.

### Data Table (Experimental)

An auto-updating data table is provided here however this functionality is experimental and not particualrly configurable. An interface
to it is included here because it already existed in the DCJS library, however it is reccomended that for more bespoke data tables,
you consider implementing your own via the callbacks / getter methods provided by the main timeline. 
