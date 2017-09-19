/**
 * IRIS Timelineviewer BarChart
 *
 * Barchart visualisation for timeline events.
 *
 * @module IRIS.BarChart
 * @class IRIS.BarChart
 */
import Chart from './chart';
import dc from 'dc/dc';

export default class BarChart extends Chart {

  /**
   * Renders the chart into the appropriate element.
   * @public
   * @method render
   * @param {object} dimension the dimension object (from crossfilter)
   * @param {object} group the group object from crossfilter
   */
  render(dimension, group) {
    this._initializeChart(dc.barChart, dimension, group);

    this._dcChart.render();
  }

  /**
   * Interaction evetns for bar charts
   * @public
   */
  _initializeInteractions() {
    this._dcChart.selectAll('.bar').on('click', (t) => this._eventEmitter.emit('dataClick', t));
  }
}