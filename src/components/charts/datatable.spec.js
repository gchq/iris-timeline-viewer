import TimelineViewer from '../timelineviewer.component';
import EventEmitter from '../event-emitter';

describe('IRIS.TimelineViewer.DataTable', function () {

  var dataTableContainer, timeline, dataTable;

  var exampleData = [{
      "date": "28/10/1982",
      "application": "netscape",
      "text": "some text"
    },
    {
      "date": "29/10/1982",
      "application": "firefox",
      "text": "some text"
    },
    {
      "date": "29/10/1982",
      "application": "firefox",
      "text": "some text"
    }
  ];
  var exampleColumns = [function (d) {
    return d.date;
  }, function (d) {
    return d.application;
  }];
  var exampleGroupingRule = function (d) {
    return d.date.slice(d.date.indexOf('/') + 1);
  };

  beforeEach(function () {
    document.body.innerHTML = null;

    // Timeline container
    var timelineContainer = document.createElement('div');
    timelineContainer.setAttribute('id', 'timelineContainer');
    document.body.appendChild(timelineContainer);

    // Data table container
    dataTableContainer = document.createElement('div');
    dataTableContainer.setAttribute('id', 'dataTableContainer');
    document.body.appendChild(dataTableContainer);

    var options = {
      dataTableColumns: exampleColumns,
      dataTableGroupingRule: exampleGroupingRule
    }

    timeline = new TimelineViewer(timelineContainer, options);
    timeline.createDataTable('dataTableContainer');
    dataTable = timeline._dataTable;
  });

  describe('IRIS.TimelineViewer.DataTable()', function () {
    it('sets a reference to the container div', function () {
      expect(dataTable._containerId).to.equal(dataTableContainer.id);
    });

    it('sets a reference to the parent timeline', function () {
      expect(dataTable._timeline).to.equal(timeline);
    });

    it('initializes a new event emitter', function () {
      expect(dataTable._eventEmitter).to.be.instanceOf(EventEmitter);
    });
  });

  describe('#valid', function () {
    it('returns true if the data table can feasably be rendered', function () {
      expect(dataTable.valid()).to.be.true;
    });
    context('when there is no dataTableColumns specified', function () {
      it('returns false', function () {
        timeline.setOption('dataTableColumns', null);
        expect(dataTable.valid()).to.be.false;
      });
    });
    context('when there is no dataTableGroupingRule specified', function () {
      it('returns false', function () {
        timeline.setOption('dataTableGroupingRule', null);
        expect(dataTable.valid()).to.be.false;
      });
    });
  });

  describe('Rendering', function () {

    beforeEach(function (done) {
      dataTable.on('afterRender', done);
      timeline.setData(exampleData);
      timeline.render();
    });

    it('renders the table', function () {
      expect(dataTableContainer.innerHTML).to.include('dc-table-row');
    });
  });

  describe('#size', function () {
    it('returns the max size as defined by the parent timeline', function () {
      expect(dataTable.size()).to.equal(timeline.getOption('dataTableSize'));
    });
  });

  describe('#columns', function () {
    it('returns the columns closure array as defined by the parent timeline', function () {
      expect(dataTable.columns()).to.equal(timeline.getOption('dataTableColumns'));
    });
  });
});