/**
 * IRIS Timelineviewer Chart (abstract class)
 *
 * Chart visualisation for timeline events - inherit from this class and override the #render method.
 *
 * @module IRIS.Timelineviewer.Chart
 * @class IRIS.Timelineviewer.Chart
 */
import EventEmitter from '../event-emitter';
import d3 from 'd3';

export default class Chart {

  /**
   * Constructs a new IRIS Timelineviewer chart. Note: This is an abstract class, and can not
   * be instantiated directly (only derived classes can be instantiated).
   *
   * @class IRIS.Timelineviewer.Chart
   * @constructor Timelineviewer.Chart
   * @param {TimeLine} timeline the timeline this chart is visualising
   * @example
   *      new IRIS.Timelineviewer.Chart();
   */
  constructor(containerId, timeline) {
    this._initializeEvents();
    this._containerId = containerId;
    this._timeline = timeline;
  }

  /**
   * Hook into a chart event.
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
   * Renders the chart into the appropriate element.
   * @public
   * @method render
   * @param {object} dimension the dimension object (from crossfilter)
   * @param {object} group the group object from crossfilter
   */
  render(dimension, group) {
    throw 'Implement render method in derived class';
  }

  /**
   * Sets the selection range (brush) dates.
   * @public
   * @method setSelectionRange
   */
  setSelectionRange(from, to) {
    this._eventEmitter.emit('beforeSetSelectionRange');
    this._selectionRange = (from && to) ? [from, to] : [];
    this._eventEmitter.emit('afterSetSelectionRange');
    this._eventEmitter.emit('afterSelectionRangeChanged');
  }

  /**
   * Gets the selection range (brush) dates from the chart.
   * @public
   * @method getSelectionRange
   * @returns {Array} array of 2 elements, representing from and to dates.
   */
  getSelectionRange() {
    if (this._dcChart) {
      return this._dcChart.filters()[0] || [];
    } else {
      return this._selectionRange;
    }
  }

  /**
   * Clears the selection range (brush) dates.
   * @public
   * @method clearSelectionRange
   */
  clearSelectionRange() {
    this.setSelectionRange(null, null);
  }

  /**
   * Advance the date window to the next period
   *
   * @public
   * @method nextPeriod
   */
  nextPeriod() {
    this._eventEmitter.emit('beforeNextPeriod');
    this._timeline.timeGranularity[this._timeline.getOption('displayNavigationStep')].increment(this._currentStartDate);
    this._timeline.timeGranularity[this._timeline.getOption('displayNavigationStep')].increment(this._currentEndDate);
    this._eventEmitter.emit('afterNextPeriod');
    this._eventEmitter.emit('periodChanged');
  }

  /**
   * Retreat the date window to the previous period
   *
   * @public
   * @method previousPeriod
   */
  previousPeriod() {
    this._eventEmitter.emit('beforePreviousPeriod');
    this._timeline.timeGranularity[this._timeline.getOption('displayNavigationStep')].decrement(this._currentStartDate);
    this._timeline.timeGranularity[this._timeline.getOption('displayNavigationStep')].decrement(this._currentEndDate);
    this._eventEmitter.emit('afterPreviousPeriod');
    this._eventEmitter.emit('periodChanged');
  }

  /**
   * Display width.
   * @public
   * @method width
   */
  width() {
    return this._timeline.getOption('displayWidth');
  }

  /**
   * Display height.
   * @public
   * @method height
   */
  height() {
    return this._timeline.getOption('displayHeight');
  }

  /**
   * Display margins.
   * @public
   * @method margins
   */
  margins() {
    return this._timeline.getOption('displayMargins');
  }

  /**
   * Display margins.
   * @public
   * @method margins
   */
  brushable() {
    return this._timeline.getOption('displayInteractionType') === 'brush';
  }

  /**
   * Display ticks.
   * @public
   * @method ticks
   */
  ticks() {
    return this._timeline.getOption('displayTicks');
  }

  /**
   * Display colours.
   * @public
   * @method colors
   */
  colors() {
    return this._timeline.getOption('displayColors');
  }

  /**
   * Display start date.
   * @public
   * @method startDate
   */
  startDate() {
    return this._currentStartDate || new Date();
  }

  /**
   * Display end date.
   * @public
   * @method endDate
   */
  endDate() {
    return this._currentEndDate || new Date();
  }

  /**
   * Display scale.
   * @public
   * @method scale
   */
  scale() {
    return this._timeline.timeGranularity[this._timeline.getOption('displayScale')].scale;
  }

  /*
   *
   *
   * ------------------ END OF PUBLIC INTERFACE ------------------
   *
   *
   */

  /**
   * Initializes the _dcChart with settings common to all types of chart.
   *
   * @protected
   * @method _initializeChart
   * @param {function} chartConstructor the dc constructor to use (e.g. dc.barChart)
   * @param {object} dimension the dimension object (from crossfilter)
   * @param {object} group the group object from crossfilter
   * @returns {void} null
   */
  _initializeChart(chartConstructor, dimension, group) {

    this._dcChart = chartConstructor(`#${this._containerId}`)
      .dimension(dimension)
      .group(group)
      .width(this.width())
      .height(this.height())
      .xUnits(this.scale())
      .colors(this.colors())
      .margins(this.margins())
      .brushOn(this.brushable())
      .x(d3.time.scale().domain([this.startDate(), this.endDate()]));

    this._dcChart.yAxis().ticks(this.ticks());

    // Bubble events
    this._dcChart.on('postRender', () => this._eventEmitter.emit('afterRender'));

    // Filtering
    this._dcChart.on('filtered', () => this._filtering = true);
    this._dcChart.on('postRedraw', () => {
      if (this._filtering) {
        this._eventEmitter.emit('dataBrush');
        this._filtering = false;
      };
    });
  }

  /**
   * Sets up the event emitter and initializes the various events the timeline responds to.
   *
   * @protected
   * @method _initializeEvents
   * @returns {string} name (and version, if available) of this widget
   */
  _initializeEvents() {
    this._eventEmitter = new EventEmitter();
    this.on('afterSetSelectionRange', this._updateDcChartSelectionRange);
    this.on('dataBrush', () => this._eventEmitter.emit('afterSelectionRangeChanged'));
    this.on('afterRender', this._initializeInteractions);
  }

  /**
   * initializes the start / end dates.
   *
   * @protected
   * @method _initializeDates
   * @returns {void} null
   */
  _initializeDates() {
    var startDate = this._timeline.getOption('displayStartDate');
    this._currentStartDate = (startDate === 'auto') ? this._timeline.earliestDate() : startDate;

    var endDate = this._timeline.getOption('displayEndDate');
    this._currentEndDate = (endDate === 'auto') ? this._timeline.latestDate() : endDate;
  }

  /**
   * initializes the chart interactions (set up in derived class).
   *
   * @protected
   * @method _initializeInteractions
   * @returns {void} null
   */
  _initializeInteractions() {
    throw 'Implement interactions in derived class';
  }

  /**
   * Updates the _dcChart with the current selection range (if one exists).
   *
   * @protected
   * @method _updateDcChartSelectionRange
   * @returns {void} null
   */
  _updateDcChartSelectionRange() {
    if (this._dcChart) {
      this._dcChart.filterAll();
      if (this._selectionRange.length === 2) {
        this._dcChart.filters().push(this._selectionRange);
      }
      this._dcChart.redraw();
    }
  }

}