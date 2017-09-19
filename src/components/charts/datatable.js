/**
 * IRIS Timelineviewer DataTable
 *
 * DataTable visualisation for timeline events.
 *
 * @module IRIS.DataTable
 * @class IRIS.DataTable
 */
import d3 from 'd3';
import dc from 'dc/dc';
import EventEmitter from '../event-emitter';

export default class DataTable {

  /**
   * Constructs a new IRIS Timelineviewer data table.
   * @class IRIS.Timelineviewer.DataTable
   * @constructor Timelineviewer.DataTable
   * @param {string} containerId id of the element to house the data table
   * @example
   *      new IRIS.Timelineviewer.DataTable();
   */
  constructor(containerId, timeline) {
    this._containerId = containerId;
    this._timeline = timeline;
    this._eventEmitter = new EventEmitter();
  }

  /**
   * Hook into a data table event.
   * @public
   * @method on
   * @param {string} eventName the event to hook into
   * @param {function} callback the callback to run
   * @returns {null}
   */
  on(eventName, callback) {
    const self = this;
    this._eventEmitter.on(eventName, () => callback.call(self));
  }

  /**
   * Returns true if this data table is valid, meaning it can be rendered. A data table
   * is considered valid only if the grouping rules, columns and element have been specified
   * for the timeline.
   *
   * @public
   * @method valid
   * @returns {boolean}
   */
  valid() {
    return !(this.columns() === null || this.groupingRule() === null || this._containerId === null);
  }

  /**
   * Renders the data table into the appropriate element.
   * @public
   * @method render
   * @param {object} dimension the dimension object (from crossfilter)
   */
  render(dimension) {
    if (!this.valid()) {
      return;
    }

    var self = this;

    this._dcDataTable = dc.dataTable(`#${this._containerId}`)
      .dimension(dimension)
      .group(this.groupingRule())
      .columns(this.columns())
      .size(this.size())
      .sortBy(d => d.dDate)
      .order(d3.ascending);

    // Bubble events
    this._dcDataTable.on('postRender', () => self._eventEmitter.emit('afterRender'));
    this._dcDataTable.render();
  }

  /**
   * Maximum size that the data table can be.
   * @public
   * @method size
   */
  size() {
    return this._timeline.getOption('dataTableSize');
  }

  /**
   * Maximum size that the data table can be.
   * @public
   * @method columns
   */
  columns() {
    return this._timeline.getOption('dataTableColumns');
  }

  /**
   * Maximum size that the data table can be.
   * @public
   * @method columns
   */
  groupingRule() {
    return this._timeline.getOption('dataTableGroupingRule');
  }

}