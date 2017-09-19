/**
 * IRIS Timelineviewer LineChart
 *
 * Linechart visualisation for timeline events.
 *
 * @module IRIS.LineChart
 * @class IRIS.LineChart
 */
import Chart from './chart';
import dc from 'dc/dc';

export default class LineChart extends Chart {

  /**
   * Renders the chart into the appropriate element.
   * @public
   * @method render
   * @param {object} dimension the dimension object (from crossfilter)
   * @param {object} group the group object from crossfilter
   */
  render(dimension, group) {
    this._initializeChart(dc.lineChart, dimension, group);

    this._dcChart
      .renderArea(false);

    this._dcChart.render();
  }

  /**
   * Interaction evetns for line charts
   * @public
   */
  _initializeInteractions() {
    this._dcChart.selectAll('.dot').on('click', (t) => this._eventEmitter.emit('dataClick', t));
  }

}