import TimelineViewer from './timelineviewer.component';
import Chart from './charts/chart';
import LineChart from './charts/linechart';
import AreaChart from './charts/areachart';
import BarChart from './charts/barchart';
import DataTable from './charts/datatable';
import EventEmitter from './event-emitter';

describe('iris.timelineviewer', function () {

  // This example data is purposefully not in date order - some of
  // the tests check that order is not important.
  var exampleData = [{
      "date": "30/10/1982",
      "application": "firefox",
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
      "date": "24/10/1982",
      "application": "netscape",
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
    }
  ];

  var timelineContainer, timeline;

  beforeEach(function () {
    document.body.innerHTML = null;
    timelineContainer = document.createElement('div');
    timelineContainer.setAttribute('id', 'timelineContainer');
    document.body.appendChild(timelineContainer);

    timeline = new TimelineViewer(timelineContainer);
  });

  describe('IRIS.Timelineviewer.Timeline()', function () {
    it('adds an attribution element with correct name', function () {
      expect(document.querySelector('.irisTimelineviewer > .itAttribution').textContent)
        .to.match(/^IRIS Timelineviewer/);
    });

    it('initializes a new event emitter', function () {
      expect(timeline._eventEmitter).to.be.instanceOf(EventEmitter);
    });

    it('initializes a new chart', function () {
      expect(timeline._chart).to.be.instanceOf(Chart);
    });

    it('defaults to a bar chart', function () {
      expect(timeline._chart).to.be.instanceOf(BarChart);
    });

    it('initializes _data to be an empty array', function () {
      expect(timeline._data).to.eql([]);
    });

    it('initiallly has no data table', function () {
      expect(timeline._dataTable).to.be.empty;
    });
  });

  //
  // Data access
  //
  // Tests concerned with the getting and setting of data in the timeline
  describe('_data property', function () {

    it('starts off as null', function () {
      expect(timeline._data).to.be.blank;
    });

    describe('#setData', function () {
      it('emits a beforeData / afterData event', function () {
        var spy = sinon.spy();
        timeline.on('beforeSetData', spy);
        timeline.on('afterSetData', spy);
        timeline.setData(exampleData);
        expect(spy.callCount).to.equal(2);
      });

      it('creates a dDate property, the parsed version of the date', function () {
        timeline.setData(exampleData);
        expect(timeline.getData().sort(timeline._dateOrderComparator)[0].dDate).to.eql(new Date(1982, 9, 24));
      });
    });

    describe('#getData/#setData', function () {
      it('updates the _data instance variable and retrieves it', function () {
        timeline.setData(exampleData);
        expect(timeline.getData()).to.eql(exampleData);
      });
    });
  });

  describe('Option Interface', function () {
    context('when constructing a timeline viewer', function () {

      it('allows you to set options', function () {
        var timeline = new TimelineViewer(timelineContainer, {
          displayHeight: 301
        });
        expect(timeline._options.displayHeight).to.equal(301);
      });
    });

    describe('default options', function () {
      it('exist and are used if option is not specified', function () {
        var timeline = new TimelineViewer(timelineContainer, {
          displayHeight: 301
        });

        expect(timeline.getOption('displayHeight')).to.equal(301); // explicitly set above
        expect(timeline.getOption('displayWidth')).to.equal(1500); // the default option
      });
    });

    describe("#getOption", function () {
      it('provides an interface for retrieving an option value', function () {
        var timeline = new TimelineViewer(timelineContainer, {
          displayHeight: 300
        });
        expect(timeline.getOption('displayHeight')).to.equal(300);
      });
    });

    describe("#setOption", function () {
      it('provides an interface for setting an option value', function () {
        var timeline = new TimelineViewer(timelineContainer, {
          displayHeight: 300
        });
        timeline.setOption('displayHeight', 301);

        expect(timeline.getOption('displayHeight')).to.equal(301);
      });

      it('raises a generic "option changed" event', function () {
        var spy = sinon.spy();
        timeline.on('beforeSetOption', spy);
        timeline.on('afterSetOption', spy);
        timeline.setOption('displayHeight', 301);

        expect(spy.callCount).to.equal(2);
      });

      it('raises a change event for that specific option', function () {
        var spy = sinon.spy();
        timeline.on('beforeSetOption:displayHeight', spy);
        timeline.on('afterSetOption:displayHeight', spy);
        timeline.on('afterSetOption:displayWidth', spy);
        timeline.setOption('displayHeight', 301);

        expect(spy.callCount).to.equal(2);
      });
    });



    describe('Option Features', function () {

      describe('displayChartType', function () {
        it('allows you to create timelines with line charts', function () {
          var timeline = new TimelineViewer(timelineContainer, {
            displayChartType: 'line'
          });
          expect(timeline._chart).to.be.instanceOf(LineChart);
        });
        context('when changed to line after perviously being bar', function () {
          it('changes the chart type even if already initialized', function () {
            timeline.setOption('displayChartType', 'line');
            expect(timeline._chart).to.be.instanceOf(LineChart);
          });
        })
        it('allows you to create timelines with area charts', function () {
          var timeline = new TimelineViewer(timelineContainer, {
            displayChartType: 'area'
          });
          expect(timeline._chart).to.be.instanceOf(AreaChart);
        });
        context('when changed to area after perviously being bar', function () {
          it('changes the chart type even if already initialized', function () {
            timeline.setOption('displayChartType', 'area');
            expect(timeline._chart).to.be.instanceOf(AreaChart);
          });
        })
      });

      describe('dataDateHandler', function () {
        it('allows users to specify their own date property rather than the default "date" property', function () {
          timeline.setOption('dataDateHandler', function (d) {
            return d.foo
          });
          timeline.setData([{
            "foo": "01/01/1994"
          }]);

          expect(timeline.getData()[0].dDate).to.eql(new Date(1994, 0, 1));
        });
      });

      describe('displayMargins', function () {
        it('sets the margins on the chart', function () {
          var margins = {
            top: 1,
            right: 2,
            bottom: 3,
            left: 4
          };
          timeline.setOption('displayMargins', margins);
          timeline.render();
          expect(timeline._chart._dcChart.margins()).to.eql(margins);
        });
      });

      describe('displayStartDate', function () {
        context('when you set this option', function () {
          it('emits a periodChanged event', function () {
            var spy = sinon.spy();
            timeline.on('periodChanged', spy);
            timeline.setOption('displayStartDate', new Date());
            expect(spy.called).to.be.true;
          });
        });
      });
      describe('displayEndDate', function () {
        context('when you set this option', function () {
          it('emits a periodChanged event', function () {
            var spy = sinon.spy();
            timeline.on('periodChanged', spy);
            timeline.setOption('displayEndDate', new Date());
            expect(spy.called).to.be.true;
          });
        });
      });
    });

    describe('#render', function () {
      context('when you have not yet called #render', function () {
        it('does not render the chart', function () {
          expect(timelineContainer.innerHTML).to.not.include('chart-body');
        });
      });
      context('when you call #render', function () {
        it('renders the chart', function () {
          timeline.render();
          expect(timelineContainer.innerHTML).to.include('chart-body');
        });
      });
    });

    describe('#createDataTable', function () {
      it('creates a dataTable', function () {
        timeline.createDataTable('myDivId');
        expect(timeline._dataTable).to.be.an.instanceOf(DataTable);
      });
      it('fires callbacks before and after creation', function () {
        var spy = sinon.spy();
        timeline.on('beforeCreateDataTable', spy);
        timeline.on('afterCreateDataTable', spy);
        timeline.createDataTable('myDivId');
        expect(spy.calledTwice).to.be.true;
      });
    });

    describe('#earliestDate', function () {
      it('returns the earliest date represented by the data', function () {
        timeline.setData(exampleData);
        expect(timeline.earliestDate()).to.eql(new Date(1982, 9, 24));
      })
    });

    describe('#latestDate', function () {
      it('returns the earliest date represented by the data', function () {
        timeline.setData(exampleData);
        expect(timeline.latestDate()).to.eql(new Date(1982, 9, 30));
      })
    });

    describe('Filtering interface', function () {
      var exampleFilter = function (d) {
        return d.application === 'netscape';
      }

      describe('#setFilter/#getFilter', function () {
        it('sets/gets the filter on the timeline', function () {
          timeline.setFilter(exampleFilter);
          expect(timeline.getFilter()).to.equal(exampleFilter);
        });
      });

      describe('#setFilter', function () {
        it('raises a beforeFilter/afterFilter event', function () {
          var spy = sinon.spy();
          timeline.on('beforeSetFilter', spy);
          timeline.on('afterSetFilter', spy);
          timeline.setFilter(exampleFilter);
          expect(spy.calledTwice).to.be.true;
        });
      });

      describe('#clearFilter', function () {
        it('Clears the current filter', function () {
          timeline.setFilter(exampleFilter);
          timeline.clearFilter();
          expect(timeline.getFilter()).to.be.blank;
        });
        it('raises a beforeFilter/afterFilter event', function () {
          var spy = sinon.spy();
          timeline.on('beforeSetFilter', spy);
          timeline.on('afterSetFilter', spy);
          timeline.clearFilter();
          expect(spy.calledTwice).to.be.true;
        });
      });

      context('when timeline data is filtered', function () {
        beforeEach(function () {
          timeline.setData(exampleData);
        });

        describe('#getData', function () {
          it('only shows you the filtered data', function () {
            timeline.setFilter(exampleFilter);
            expect(timeline.getData().length).to.equal(1);
          });
        });

        // This caters for situations where the data is both brushed (selected) and filtered.
        context('#getSelectedData', function () {
          // In the example data, if we include the whole lot in the selection but filter on netscape,
          // we should only see the netscape record.
          it('includes things if they are both filtered and selected', function () {
            var from = new Date(1980, 1, 1);
            var to = new Date(1990, 1, 1);
            timeline.setSelectionRange(from, to);
            timeline.setFilter(function (d) {
              return d.application === 'netscape'
            });

            expect(timeline.getSelectedData().length).to.equal(1);
          });

          // In the example data, if we filter for netscape but don't include it in the selection range,
          // we should not see it appear.
          it('doesnt include brushed data just because it is included in the filter', function () {
            var from = new Date(1982, 9, 29);
            var to = new Date(1982, 9, 30);
            timeline.setSelectionRange(from, to);
            timeline.setFilter(function (d) {
              return d.application === 'netscape'
            });

            expect(timeline.getSelectedData()).to.be.empty;
          });

          // In the example data, if we brush firefox data and filter for firefox, we should see only
          // the brushed range's worth of firefox data (not ALL firefox data).
          it('doesnt include brushed data just because it is included in the filter', function () {
            var from = new Date(1982, 9, 29);
            var to = new Date(1982, 9, 30);
            timeline.setSelectionRange(from, to);
            timeline.setFilter(function (d) {
              return d.application === 'firefox'
            });

            expect(timeline.getSelectedData().length).to.equal(2);
          });
        });
      });
    });

    describe('Navigation interface', function () {

      beforeEach(function () {
        timeline.setOption('displayStartDate', new Date(1990, 1, 1));
        timeline.setOption('displayEndDate', new Date(1991, 1, 1));
      });

      // Note: The other displayNavigationStep options are tested in the chart tests, this one
      // here is just to ensure the interface is available at timeline level.
      context('when displayNavigationStep is years', function () {
        beforeEach(function () {
          timeline.setOption('displayNavigationStep', 'years');
        });
        describe('#nextPeriod', function () {
          it('advances the start / end dates by displayNavigationStep amount', function () {
            timeline.nextPeriod();
            expect(timeline._chart.startDate()).to.eql(new Date(1991, 1, 1));
            expect(timeline._chart.endDate()).to.eql(new Date(1992, 1, 1));
          });

          it('fires callbacks before and after', function () {
            var spy = sinon.spy();
            timeline.on('periodChanged', spy);
            timeline.on('beforeNextPeriod', spy);
            timeline.on('afterNextPeriod', spy);
            timeline.nextPeriod();
            expect(spy.calledThrice).to.be.true;
          });
        });
        describe('#previousPeriod', function () {
          it('decreases the start / end dates by displayNavigationStep amount', function () {
            timeline.previousPeriod();
            expect(timeline._chart.startDate()).to.eql(new Date(1989, 1, 1));
            expect(timeline._chart.endDate()).to.eql(new Date(1990, 1, 1));
          });

          it('fires callbacks before and after', function () {
            var spy = sinon.spy();
            timeline.on('periodChanged', spy);
            timeline.on('beforePreviousPeriod', spy);
            timeline.on('afterPreviousPeriod', spy);
            timeline.previousPeriod();
            expect(spy.calledThrice).to.be.true;
          });
        });
      });
    });

    describe('Selection interface', function () {
      var from, to;

      beforeEach(function () {
        from = new Date(1982, 9, 27);
        to = new Date(1982, 9, 27);
        timeline.setData(exampleData);
      });

      describe('#setSelectionRange', function () {
        beforeEach(function () {
          sinon.spy(timeline._chart, 'setSelectionRange');
        });
        afterEach(function () {
          timeline._chart.setSelectionRange.restore();
        });

        it('sets the selection range for the bar chart', function () {
          timeline.setSelectionRange(from, to);
          expect(timeline._chart.setSelectionRange.calledWith(from, to)).to.be.true;
        });
      });

      describe('#getSelectionRange', function () {
        beforeEach(function () {
          sinon.spy(timeline._chart, 'getSelectionRange');
        });
        afterEach(function () {
          timeline._chart.getSelectionRange.restore();
        });

        it('gets the selection range for the bar chart', function () {
          timeline.getSelectionRange();
          expect(timeline._chart.getSelectionRange.calledOnce).to.be.true;
        });
      });

      describe('#setSelectionRange', function () {
        it('fires callbacks before and after', function () {
          var spy = sinon.spy();
          timeline.on('beforeSetSelectionRange', spy);
          timeline.on('afterSetSelectionRange', spy);
          timeline.setSelectionRange(from, to);
          expect(spy.calledTwice).to.be.true;
        });
      });

      describe('#clearSelectionRange', function () {
        beforeEach(function () {
          sinon.spy(timeline._chart, 'clearSelectionRange');
        });
        afterEach(function () {
          timeline._chart.clearSelectionRange.restore();
        });

        it('gets the selection range for the bar chart', function () {
          timeline.clearSelectionRange();
          expect(timeline._chart.clearSelectionRange.calledOnce).to.be.true;
        });
      });

      describe('#getSelectedData', function () {
        beforeEach(function () {
          timeline.setData(exampleData);
        });
        context('when a selection has occurred', function () {
          context('involving two bits of data', function () {
            it('returns only the selected data', function () {
              var from = new Date(1982, 9, 27);
              var to = new Date(1982, 9, 28);
              timeline.setSelectionRange(from, to);
              expect(timeline.getSelectedData().length).to.equal(2);
            });
          });
          context('involving three bits of data', function () {
            it('returns only the selected data', function () {
              var from = new Date(1982, 9, 26);
              var to = new Date(1982, 9, 28);
              timeline.setSelectionRange(from, to);
              expect(timeline.getSelectedData().length).to.equal(3);
            });
          });
        });
        context('when no data is selected', function () {
          it('returns an empty array', function () {
            timeline.clearSelectionRange(); // We haven't brushed anyway, this is just belt and braces :)
            expect(timeline.getSelectedData()).to.be.empty;
          });
        });
      });


    });

  });

});