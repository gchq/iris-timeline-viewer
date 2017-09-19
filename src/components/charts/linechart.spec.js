import TimelineViewer from '../timelineviewer.component';

describe('IRIS.TimelineViewer.LineChart', function () {

  var exampleData = [{
      "date": "24/10/1982",
      "application": "netscape",
      "text": "some text"
    },
    {
      "date": "25/10/1982",
      "application": "firefox",
      "text": "some text"
    },
    {
      "date": "26/10/1982",
      "application": "firefox",
      "text": "some text"
    },
    {
      "date": "27/10/1982",
      "application": "firefox",
      "text": "some text"
    },
    {
      "date": "28/10/1982",
      "application": "firefox",
      "text": "some text"
    },
    {
      "date": "29/10/1982",
      "application": "firefox",
      "text": "some text"
    },
    {
      "date": "30/10/1982",
      "application": "firefox",
      "text": "some text"
    }
  ];

  var timelineContainer, timeline, lineChart;

  beforeEach(function () {
    document.body.innerHTML = null;
    timelineContainer = document.createElement('div');
    timelineContainer.setAttribute('id', 'timelineContainer');
    document.body.appendChild(timelineContainer);

    timeline = new TimelineViewer(timelineContainer, {
      displayChartType: 'line'
    });
    lineChart = timeline._chart;
  });

  describe('#render', function () {
    beforeEach(function (done) {
      lineChart.on('afterRender', done);
      timeline.setData(exampleData);
      timeline.render();
    });

    it('renders the chart', function () {
      expect(timelineContainer.innerHTML).to.include('chart-body');
    });
  });
});