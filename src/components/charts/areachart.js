/**
 * IRIS Timelineviewer AreaChart
 *
 * Areachart visualisation for timeline events.
 *
 * @module IRIS.AreaChart
 * @class IRIS.AreaChart
 */

import Chart from './chart';
import dc from 'dc/dc';

export default class AreaChart extends Chart {

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
      .renderArea(true);

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