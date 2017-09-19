/**
 * IRIS Timelineviewer Component
 *
 * @module IRIS.Timelineviewer.Timeline
 * @class IRIS.Timelineviewer.Timeline
 */

import d3 from 'd3';
import crossfilter from 'crossfilter';
import dc from 'dc/dc';
import LineChart from './charts/linechart';
import AreaChart from './charts/areachart';
import BarChart from './charts/barchart';
import DataTable from './charts/datatable';
import EventEmitter from './event-emitter';

export default class TimelineViewer {

  get NAME() {
    return 'IRIS Timelineviewer'
  };

  get VERSION() {
    return null
  } // TODO

  get CSS_CONTAINER() {
    return 'irisTimelineviewer'
  };

  get CSS_ATTR() {
    return 'itAttribution'
  };

  // Used for sorting data by date
  get _dateOrderComparator() {
    return (a, b) => (a.dDate > b.dDate) ? 1 : -1
  };

  //
  // Options
  //
  // Options are set upon construction, although can be changed post-construction using
  // the #setOption public method.
  static get DEFAULT_OPTIONS() {
    return {
      // Function specifying how to "count" each event. By default, each event counts as 1 on the y-axis, however
      // it might be that your data actually contains its own count (e.g. item.count) - this function should return
      // the number to count the incident as.
      dataCountHandler: d => 1,

      // By default, timeline viewer will expect each item in the data array to have a 'date' property with the
      // date in it. If the date comes from somewhere else, override this functionality here.
      dataDateHandler: d => d.date,

      // By default the date is assumed to be dd/mm/yyyy. Override that using this option, see dc.js docs for
      // available date formatting options.
      dataDateFormat: '%d/%m/%Y',

      // The chart type to display. Can be either "bar", "line" or "area".
      displayChartType: 'bar',

      // The interaction type. Can be either "click" or "brush".
      displayInteractionType: 'click',

      // The height of the component.
      displayHeight: 300,

      // The width of the component.
      displayWidth: 1500,

      // The margins of the component.
      displayMargins: {
        top: 10,
        right: 50,
        bottom: 30,
        left: 30
      },

      // The date to initialize the start/end of the view to. Even though your data might cover 100+ years,
      // you may want to intialize the view only looking at the 90's. Setting these dates creates a 'window'
      // just looking at the dates you specify (the other dates will be "off screen" but will still exist).
      // Setting the values to 'auto' will set the start/end to the max/min dates that the data goes to.
      displayStartDate: 'auto',
      displayEndDate: 'auto',

      // The amount of time between each "bar" or "point". Can be set to 'seconds', 'minutes', 'days', 'weeks', 'months' or 'years'
      displayScale: 'months',

      // The amount of ticks on the Y axis.
      displayTicks: 4,

      // The colours to use for the bars / lines. Note that the option being an array is purely to accomodate future development
      // where multiple lines / bars may appear on the same graph. the array's first element will be used for the colour, and can
      // be specified in any CSS-compliant way (reserved colours or hex codes).
      displayColors: ['steelblue'],

      // The timeline allows users to skip forward and backward along the timeline using the #nextPeriod and #previousPeriod public
      // mehtods - this option defines the amount of time that should be skipped. Can be set to 'seconds', 'minutes', 'days', 'weeks',
      // 'months' or 'years'
      displayNavigationStep: 'years',

      // If a data table is rendered, this specifies the max number of records that it should display.
      dataTableSize: 20,

      // An array of functions defining the contents of each column in the data table. For example;
      //
      // dataTableColumns: [
      //  function(d) { return d.dDate; },
      //  function(d) { return d.name; },
      //  function(d) { return d.description; }
      // ]
      //
      dataTableColumns: null,

      // If using a data table, you can specify a grouping rule to group data together (e.g. "by year"). This defaults to just
      // grouping by nothing, however you could group by year / months / name / anything.
      dataTableGroupingRule: d => '&nbsp;'
    }
  };

  //
  // The timeline emits the following events
  //
  // beforeRender
  // afterRender
  // beforeSetData
  // afterSetData
  // beforeSetFilter
  // afterSetFilter
  // beforeSetSelectionRange
  // afterSetSelectionRange
  // afterSelectionRangeChanged
  // beforeSetOption:{optionName}
  // afterSetOption:{optionName}
  // beforeCreateDataTable
  // afterCreateDataTable
  // beforePreviousPeriod
  // afterPreviousPeriod
  // beforeNextPeriod
  // afterNextPeriod
  // periodChanged
  // dataClick
  // dataBrush
  //

  // Time granularity - used thorughout the chart and timeline modules to tie human-readable concepts such
  // as days, weeks etc. into d3 concepts. Possibly consider moving this out into a seperate module.
  get timeGranularity() {
    return {
      seconds: {
        singular: d3.time.second,
        scale: d3.time.seconds,
        increment: (d) => d.setSeconds(d.getSeconds() + 1),
        decrement: (d) => d.setSeconds(d.getSeconds() - 1)
      },
      minutes: {
        singular: d3.time.minute,
        scale: d3.time.minutes,
        increment: (d) => d.setMinutes(d.getMinutes() + 1),
        decrement: (d) => d.setMinutes(d.getMinutes() - 1)
      },
      hours: {
        singular: d3.time.hour,
        scale: d3.time.hours,
        increment: (d) => d.setHours(d.getHours() + 1),
        decrement: (d) => d.setHours(d.getHours() - 1)
      },
      days: {
        singular: d3.time.day,
        scale: d3.time.days,
        increment: (d) => d.setDate(d.getDate() + 1),
        decrement: (d) => d.setDate(d.getDate() - 1)
      },
      weeks: {
        singular: d3.time.week,
        scale: d3.time.weeks,
        increment: (d) => d.setDate(d.getDate() + 7),
        decrement: (d) => d.setDate(d.getDate() - 7)
      },
      months: {
        singular: d3.time.month,
        scale: d3.time.months,
        increment: (d) => d.setMonth(d.getMonth() + 1),
        decrement: (d) => d.setMonth(d.getMonth() - 1)
      },
      years: {
        singular: d3.time.year,
        scale: d3.time.years,
        increment: (d) => d.setFullYear(d.getFullYear() + 1),
        decrement: (d) => d.setFullYear(d.getFullYear() - 1)
      }
    }
  };


  /**
   * Constructs a new IRIS Timelineviewer instance.
   * @class IRIS.Timelineviewer.Timeline
   * @constructor Timelineviewer.Timeline
   * @example
   *      new IRIS.Timelineviewer.Timeline(div, options);
   * @param {HTMLDivElement} div the div in which the visualisation will be rendered, e.g. '#map'
   * @param options visualisation options (see 'options' property)
   */
  constructor(div, options = {}) {
    this._rootDiv = div;
    this._options = Object.assign({}, TimelineViewer.DEFAULT_OPTIONS, options)

    // create div
    this._containerElement = document.createElement('div');
    this._containerElement.className = this.CSS_CONTAINER;
    this._rootDiv.appendChild(this._containerElement);

    this._attributionElement = document.createElement('div');
    this._attributionElement.className = this.CSS_ATTR;
    this._attributionElement.innerHTML = '';
    this._containerElement.appendChild(this._attributionElement);

    this._data = [];

    this._initializeChart();
    this._initializeEvents();
  }

  /**
   * Create a data table within the specified element.
   *
   * @public
   * @method createDataTable
   * @param {HtmlElement} dataTableContainer The element to put the data table in. Must have an ID presently.
   * @returns {null}
   */
  createDataTable(dataTableContainerId) {
    this._eventEmitter.emit('beforeCreateDataTable');
    this._dataTable = new DataTable(dataTableContainerId, this);
    this._eventEmitter.emit('afterCreateDataTable');
  }

  /**
   * Hook into a timeline event.
   *
   * @public
   * @method on
   * @param {string} eventName the event to hook into
   * @param {function} callback the callback to run
   * @returns {null}
   */
  on(eventName, callback) {
    var self = this;
    this._eventEmitter.on(eventName, (a, b, c) => callback.call(self, a, b, c));
  }

  /**
   * Deconstructor
   *
   * @public
   * @method destroy
   */
  destroy() {
    if (typeof this._containerElement !== 'undefined' && this._containerElement != null) {
      this._containerElement.remove();
      delete this._containerElement;
    }
  }

  /**
   * Returns the value for the specified option.
   *
   * @public
   * @method getOption
   * @param {string} optionName name of the option to retrieve a value for
   * @returns {object} the value of the specified option
   */
  getOption(optionName) {
    return this._options[optionName];
  }

  /**
   * Sets the value for the specified option.
   *
   * @public
   * @method setOption
   * @param {string} optionName name of the option to set a value for
   * @param {object} optionValue value to set the option to
   * @returns {null}
   */
  setOption(optionName, optionValue) {
    this._eventEmitter.emit(`beforeSetOption`);
    this._eventEmitter.emit(`beforeSetOption:${optionName}`);
    this._options[optionName] = optionValue;
    this._eventEmitter.emit(`afterSetOption`);
    this._eventEmitter.emit(`afterSetOption:${optionName}`);
  }

  /**
   * Gets the data being rendered, filtered if there was a filter applied.
   *
   * @public
   * @method getData
   * @returns {object} the data being rendered
   */
  getData() {
    var filter = this._filter || function () {
      return true;
    };
    return this._data.filter(filter);
  }

  /**
   * Sets the data being rendered. Emits before/after events.
   *
   * @public
   * @method setData
   * @param {object} data the data to be rendered
   * @returns {null}
   */
  setData(data) {
    this._eventEmitter.emit('beforeSetData');
    this._data = data;
    this._eventEmitter.emit('afterSetData');
  }

  /**
   * Returns the data currently selected by the brush.
   * @public
   * @method getSelectedData
   */
  getSelectedData() {
    var selectionRange = this._chart.getSelectionRange();

    if (selectionRange.length === 0) {
      return [];
    } else {
      return this.getData().filter(
        (d) => d.dDate >= selectionRange[0] && d.dDate <= selectionRange[1]
      );
    }
  }

  /**
   * Sets the selection range for the chart (as if the user had dragged a brush).
   *
   * @public
   * @method setSelectionRange
   * @param {Date} from the start date
   * @param {Date} to the end date
   * @returns {null}
   */
  setSelectionRange(from, to) {
    this._chart.setSelectionRange(from, to);
  }

  /**
   * Gets the selection range for the chart (as if the user had dragged a brush).
   *
   * @public
   * @method getSelectionRange
   * @returns {Array} array representing from/to dates.
   */
  getSelectionRange() {
    return this._chart.getSelectionRange();
  }

  /**
   * Clears the selection range for the chart.
   *
   * @public
   * @method clearSelectionRange
   */
  clearSelectionRange() {
    this._chart.clearSelectionRange();
  }

  /**
   * Sets the filter for the chart.
   *
   * @public
   * @method setFilter
   * @param {function} filter function that provides filtering functionality
   * @returns {null}
   */
  setFilter(filter) {
    this._eventEmitter.emit('beforeSetFilter');
    this._filter = filter;
    this._eventEmitter.emit('afterSetFilter');
  }

  /**
   * Gets the filter for the chart.
   *
   * @public
   * @method getFilter
   * @returns {function} filter function .
   */
  getFilter() {
    return this._filter;
  }

  /**
   * Clears the filter for the chart.
   *
   * @public
   * @method clearFilter
   * @returns {null}
   */
  clearFilter() {
    this.setFilter(null);
  }

  /**
   * Renders the component.
   *
   * @public
   * @method render
   * @returns {null}
   */
  render() {
    this._eventEmitter.emit('beforeRender');
    this._chart.render(this._dimension, this._group);
    if (this._dataTable) {
      this._dataTable.render(this._dimension);
    }
  }

  /**
   * Finds the earliest date represented by the current data.
   *
   * @public
   * @method earliestDate
   * @returns {Date} the earliest date in the current data array
   */
  earliestDate() {
    var earliestDataItem = this.getData().sort(this._dateOrderComparator)[0];
    return earliestDataItem ? earliestDataItem.dDate : new Date();
  }

  /**
   * Finds the latest date represented by the current data.
   *
   * @public
   * @method latestDate
   * @returns {Date} the latest date in the current data array
   */
  latestDate() {
    var data = this.getData().sort(this._dateOrderComparator);
    var latestDataItem = data[data.length - 1];
    return latestDataItem ? latestDataItem.dDate : new Date();
  }

  /**
   * Advance the date window of the chart.
   *
   * @public
   * @method nextPeriod
   * @returns {null}
   */
  nextPeriod() {
    this._chart.nextPeriod();
  }

  /**
   * Retreats the date window of the chart.
   *
   * @public
   * @method previousPeriod
   * @returns {null}
   */
  previousPeriod() {
    this._chart.previousPeriod();
  }

  /*
   *
   *
   * ------------------ END OF PUBLIC INTERFACE ------------------
   *
   *
   */

  /**
   * Sets up the event emitter and subscribes to various events.
   *
   * @private
   * @method _initializeEvents
   * @returns {null}
   */
  _initializeEvents() {
    var self = this;
    this._eventEmitter = new EventEmitter();

    this.on('afterSetData', this._parseDataDates);
    this.on('beforeRender', this._setupDcProperties);
    this.on('afterSetData', () => self._chart._initializeDates());
    this.on('afterSetOption:displayChartType', self._initializeChart);

    // Date-changing functionaliy
    var dateChangedFn = () => {
      self._eventEmitter.emit('periodChanged');
      self._chart._initializeDates();
    };
    this.on('afterSetOption:displayStartDate', dateChangedFn);
    this.on('afterSetOption:displayEndDate', dateChangedFn);

    // Bubble up various chart events to allow listening from the timeline itself.
    this._chart.on('afterRender', () => self._eventEmitter.emit('afterRender'));
    this._chart.on('beforeSetSelectionRange', () => self._eventEmitter.emit('beforeSetSelectionRange'));
    this._chart.on('afterSetSelectionRange', () => self._eventEmitter.emit('afterSetSelectionRange'));
    this._chart.on('beforeNextPeriod', () => self._eventEmitter.emit('beforeNextPeriod'));
    this._chart.on('beforePreviousPeriod', () => self._eventEmitter.emit('beforePreviousPeriod'));
    this._chart.on('afterNextPeriod', () => self._eventEmitter.emit('afterNextPeriod'));
    this._chart.on('afterPreviousPeriod', () => self._eventEmitter.emit('afterPreviousPeriod'));
    this._chart.on('periodChanged', () => self._eventEmitter.emit('periodChanged'));
    this._chart.on('dataClick', (t) => self._handleDataClick(t));
    this._chart.on('dataBrush', () => self._handleDataBrush());
    this._chart.on('afterSelectionRangeChanged', () => self._eventEmitter.emit('afterSelectionRangeChanged'));
  }

  /**
   * Handles the act of a user having brushed the chart.
   *
   * @private
   * @method _handleDataBrush
   */
  _handleDataBrush() {
    this._eventEmitter.emit('dataBrush', this.getSelectionRange(), this.getSelectedData());
  }

  /**
   * Handles the act of a user having clicked the chart.
   *
   * @private
   * @method _handleDataClick
   */
  _handleDataClick(target) {
    this._eventEmitter.emit('dataClick', target.data.key, this._dimension.filter(target.data.key).top(target.data.value));
  }

  /**
   * Sets up the chart based on the displayChartType option.
   *
   * @private
   * @method _initializeChart
   */
  _initializeChart() {
    var chartConstructor;

    switch (this._options.displayChartType) {
      case 'line':
        chartConstructor = LineChart;
        break;
      case 'area':
        chartConstructor = AreaChart;
        break;
      default:
        chartConstructor = BarChart;
        break;
    }
    this._chart = new chartConstructor(this._rootDiv.id, this);
  }

  /**
   * Adds a parsed version of the date to the objects in the _data array (called dDate). Called automatically
   * after data is set (afterSetData event).
   *
   * @private
   * @method _parseDataDates
   * @returns {null}
   */
  _parseDataDates() {
    if (this._data) {
      var dateFormat = d3.time.format(this._options.dataDateFormat);
      for (var i = 0; i < this._data.length; i++) {
        this._data[i].dDate = dateFormat.parse(this._options.dataDateHandler(this._data[i]));
      }
    }
  }

  /**
   * Sets up the various DC variables required to start rendering. This method will be called
   * automatically prior to rendering the timeline (beforeRender event).
   *
   * @private
   * @method _setupDcProperties
   * @returns {null}
   */
  _setupDcProperties() {
    if (this._data) {
      this._ndx = crossfilter(this.getData());
      this._dimension = this._ndx.dimension(d => this.timeGranularity[this._options.displayScale].singular(d.dDate));
      this._group = this._dimension.group().reduceSum(this._options.dataCountHandler);
    }
  }

  /**
   * Returns the name (and version, if available) of this widget.
   *
   * @private
   * @method _getName
   * @returns {string} name (and version, if available) of this widget
   */
  _getName() {
    return `${this.NAME}${this.VERSION || ''}`;
  }

}