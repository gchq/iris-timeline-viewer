/*
 Note: The test in here are for functionality provided by the abstract 'Chart' class, but in reality
 the tests will be performed against an instance of one of its derived classes (because we can not
 instantiate an abstract class).
*/

import TimelineViewer from '../timelineviewer.component';
import EventEmitter from '../event-emitter';
import d3 from 'd3';

describe('IRIS.TimelineViewer.Chart', function () {

  // This example data is purposefully not in date order - some of
  // the tests check that order is not important.
  var exampleData = [{
      "date": "30/10/1982",
      "application": "firefox",
      "text": "some text"
    },
    {
      "date": "28/10/1982",
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
      "date": "27/10/1982",
      "application": "firefox",
      "text": "some text"
    },
    {
      "date": "24/10/1982",
      "application": "netscape",
      "text": "some text"
    },
    {
      "date": "29/10/1982",
      "application": "firefox",
      "text": "some text"
    }
  ];

  var timelineContainer, timeline, chart;

  beforeEach(function () {
    document.body.innerHTML = null;
    timelineContainer = document.createElement('div');
    timelineContainer.setAttribute('id', 'timelineContainer');
    document.body.appendChild(timelineContainer);

    timeline = new TimelineViewer(timelineContainer);
    chart = timeline._chart;
  });

  describe('IRIS.TimelineViewer.chart()', function () {

    it('sets a reference to the container div', function () {
      expect(chart._containerId).to.equal(timelineContainer.id);
    });

    it('sets a reference to the parent timeline', function () {
      expect(chart._timeline).to.equal(timeline);
    });

    it('initializes a new event emitter', function () {
      expect(chart._eventEmitter).to.be.instanceOf(EventEmitter);
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
      it('sets the selection range for the chart', function () {
        chart.setSelectionRange(from, to);
        expect(chart._selectionRange).to.eql([from, to]);
      });
      it('raises selection range before/after callbacks on the parent timeline', function () {
        var spy = sinon.spy();
        timeline.on('beforeSetSelectionRange', spy);
        timeline.on('afterSetSelectionRange', spy);

        timeline.setSelectionRange(from, to);
        expect(spy.calledTwice).to.be.true;
      });
      context('when the chart has been rendered', function () {
        beforeEach(function () {
          timeline.render();
        });

        it('also sets the fitler on the chart itself', function () {
          chart.setSelectionRange(from, to);
          expect(chart._dcChart.filters()[0]).to.eql([from, to]);
        });
        it('only ever keeps one filter on the dc chart', function () {
          timeline.setSelectionRange(from, to);
          chart.setSelectionRange(from, to); // intentional second call
          expect(chart._dcChart.filters().length).to.equal(1);
        });

      });
    });

    describe('#getSelectionRange', function () {
      it('returns the current selection range as an array', function () {
        chart.setSelectionRange(from, to);
        expect(chart.getSelectionRange()).to.eql([from, to]);
      });
    });

    describe('#clearSelectionRange', function () {
      it('sets the selectionRange property back to an empty array', function () {
        chart.setSelectionRange(from, to);
        chart.clearSelectionRange();
        expect(chart.getSelectionRange()).to.be.empty;
      });

      context('when the chart has been rendered', function () {
        beforeEach(function () {
          timeline.render();
        });

        it('also resets the fitler on the chart itself', function () {
          chart.setSelectionRange(from, to);
          chart.clearSelectionRange();
          expect(chart._dcChart.filters()).to.be.empty;
        });
      });
    });
  });

  describe('#width', function () {
    it('returns the width of the parent timeline', function () {
      expect(chart.width()).to.equal(timeline.getOption('displayWidth'));
    });
  });

  describe('#height', function () {
    it('returns the width of the parent timeline', function () {
      expect(chart.height()).to.equal(timeline.getOption('displayHeight'));
    });
  });

  describe('#margins', function () {
    it('returns the width of the parent timeline', function () {
      expect(chart.margins()).to.equal(timeline.getOption('displayMargins'));
    });
  });

  describe('#colors', function () {
    it('returns the colours from the parent timeline', function () {
      expect(chart.colors()).to.equal(timeline.getOption('displayColors'));
    });
  });

  describe('#brushable', function () {
    context('when the interaction type is "brush"', function () {
      it('returns true', function () {
        timeline.setOption('displayInteractionType', 'brush');
        expect(chart.brushable()).to.be.true;
      });
    });
    context('when the interaction type is "click"', function () {
      it('returns false', function () {
        timeline.setOption('displayInteractionType', 'click');
        expect(chart.brushable()).to.be.false;
      });
    });
  });

  describe('#ticks', function () {
    context('when ticks are explicitly specified', function () {
      it('returns the ticks of the parent timeline', function () {
        var ticksValue = 10;
        timeline.setOption('displayTicks', ticksValue);
        expect(chart.ticks()).to.equal(ticksValue);
      });
    });
  });

  describe('#startDate', function () {
    context('when the date is set to "auto"', function () {
      context('when data has been set', function () {
        it('figures out the date automatically based on the data', function () {
          var earliestDateInExampleData = new Date(1982, 9, 24);
          timeline.setData(exampleData);
          timeline.setOption('displayStartDate', 'auto');
          expect(chart.startDate()).to.eql(earliestDateInExampleData);
        });
      });
      context('when the data has not been set', function () {
        it('returns a date', function () {
          timeline.setOption('displayStartDate', 'auto');
          expect(chart.startDate()).to.be.instanceOf(Date);
        });
        it('uses todays date', function () {
          timeline.setOption('displayStartDate', 'auto');
          expect(chart.startDate().valueOf()).to.be.closeTo(new Date().valueOf(), 1000);
        });
      });
    });
    context('when date is explicitly specified', function () {
      it('returns the start date of the parent timeline', function () {
        var startDateValue = new Date(1990, 1, 1);
        timeline.setOption('displayStartDate', startDateValue);
        expect(chart.startDate()).to.equal(startDateValue);
      });
    });
  });

  describe('#endDate', function () {
    context('when the date is set to "auto"', function () {
      context('when the data has been set', function () {
        it('figures out the date automatically based on the data', function () {
          var latestDateInExampleData = new Date(1982, 9, 30);
          timeline.setData(exampleData);
          timeline.setOption('displayEndtDate', 'auto');
          expect(chart.endDate()).to.eql(latestDateInExampleData);
        });
      });
      context('when the data has not been set', function () {
        it('returns a date', function () {
          timeline.setOption('displayStartDate', 'auto');
          expect(chart.endDate()).to.be.instanceOf(Date);
        });
        it('uses todays date', function () {
          timeline.setOption('displayStartDate', 'auto');
          expect(chart.endDate().valueOf()).to.be.closeTo(new Date().valueOf(), 1000);
        });
      });
    });
    context('when date is explicitly specified', function () {
      it('returns the start date of the parent timeline', function () {
        var endDateValue = new Date(1990, 1, 1);
        timeline.setOption('displayEndDate', endDateValue);
        expect(chart.endDate()).to.equal(endDateValue);
      });
    });
  });

  describe('#nextPeriod/#previousPeriod', function () {
    var startDate, endDate;

    beforeEach(function () {
      startDate = new Date(1996, 6, 6, 0, 0, 0);
      endDate = new Date(1997, 6, 6, 0, 0, 0);
      timeline.setOption('displayStartDate', startDate);
      timeline.setOption('displayEndDate', endDate);
      chart._initializeDates();
    });

    describe('#nextPeriod', function () {
      context('when displayNavigationStep is set to years', function () {
        it('advances the dates by a year', function () {
          timeline.setOption('displayNavigationStep', 'years');
          chart.nextPeriod();
          expect(chart._currentStartDate).to.eql(new Date(1997, 6, 6));
          expect(chart._currentEndDate).to.eql(new Date(1998, 6, 6));
        });
      });
      context('when displayNavigationStep is set to months', function () {
        it('advances the dates by a month', function () {
          timeline.setOption('displayNavigationStep', 'months');
          chart.nextPeriod();
          expect(chart._currentStartDate).to.eql(new Date(1996, 7, 6));
          expect(chart._currentEndDate).to.eql(new Date(1997, 7, 6));
        });
      });
      context('when displayNavigationStep is set to weeks', function () {
        it('advances the dates by a week', function () {
          timeline.setOption('displayNavigationStep', 'weeks');
          chart.nextPeriod();
          expect(chart._currentStartDate).to.eql(new Date(1996, 6, 13));
          expect(chart._currentEndDate).to.eql(new Date(1997, 6, 13));
        });
      });
      context('when displayNavigationStep is set to days', function () {
        it('advances the dates by a week', function () {
          timeline.setOption('displayNavigationStep', 'days');
          chart.nextPeriod();
          expect(chart._currentStartDate).to.eql(new Date(1996, 6, 7));
          expect(chart._currentEndDate).to.eql(new Date(1997, 6, 7));
        });
      });
      context('when displayNavigationStep is set to hours', function () {
        it('advances the dates by an hour', function () {
          timeline.setOption('displayNavigationStep', 'hours');
          chart.nextPeriod();
          expect(chart._currentStartDate).to.eql(new Date(1996, 6, 6, 1, 0, 0));
          expect(chart._currentEndDate).to.eql(new Date(1997, 6, 6, 1, 0, 0));
        });
      });
      context('when displayNavigationStep is set to minutes', function () {
        it('advances the dates by a minute', function () {
          timeline.setOption('displayNavigationStep', 'minutes');
          chart.nextPeriod();
          expect(chart._currentStartDate).to.eql(new Date(1996, 6, 6, 0, 1, 0));
          expect(chart._currentEndDate).to.eql(new Date(1997, 6, 6, 0, 1, 0));
        });
      });
      context('when displayNavigationStep is set to seconds', function () {
        it('advances the dates by a second', function () {
          timeline.setOption('displayNavigationStep', 'seconds');
          chart.nextPeriod();
          expect(chart._currentStartDate).to.eql(new Date(1996, 6, 6, 0, 0, 1));
          expect(chart._currentEndDate).to.eql(new Date(1997, 6, 6, 0, 0, 1));
        });
      });
    });

    describe('#previousPeriod', function () {
      context('when displayNavigationStep is set to years', function () {
        it('retreats the dates by a year', function () {
          timeline.setOption('displayNavigationStep', 'years');
          chart.previousPeriod();
          expect(chart._currentStartDate).to.eql(new Date(1995, 6, 6));
          expect(chart._currentEndDate).to.eql(new Date(1996, 6, 6));
        });
      });
      context('when displayNavigationStep is set to months', function () {
        it('retreats the dates by a month', function () {
          timeline.setOption('displayNavigationStep', 'months');
          chart.previousPeriod();
          expect(chart._currentStartDate).to.eql(new Date(1996, 5, 6));
          expect(chart._currentEndDate).to.eql(new Date(1997, 5, 6));
        });
      });
      context('when displayNavigationStep is set to weeks', function () {
        it('retreats the dates by a week', function () {
          timeline.setOption('displayNavigationStep', 'weeks');
          chart.previousPeriod();
          expect(chart._currentStartDate).to.eql(new Date(1996, 5, 29));
          expect(chart._currentEndDate).to.eql(new Date(1997, 5, 29));
        });
      });
      context('when displayNavigationStep is set to days', function () {
        it('retreats the dates by a week', function () {
          timeline.setOption('displayNavigationStep', 'days');
          chart.previousPeriod();
          expect(chart._currentStartDate).to.eql(new Date(1996, 6, 5));
          expect(chart._currentEndDate).to.eql(new Date(1997, 6, 5));
        });
      });
      context('when displayNavigationStep is set to hours', function () {
        it('retreats the dates by an hour', function () {
          timeline.setOption('displayNavigationStep', 'hours');
          chart.previousPeriod();
          expect(chart._currentStartDate).to.eql(new Date(1996, 6, 5, 23, 0, 0));
          expect(chart._currentEndDate).to.eql(new Date(1997, 6, 5, 23, 0, 0));
        });
      });
      context('when displayNavigationStep is set to minutes', function () {
        it('retreats the dates by a minute', function () {
          timeline.setOption('displayNavigationStep', 'minutes');
          chart.previousPeriod();
          expect(chart._currentStartDate).to.eql(new Date(1996, 6, 5, 23, 59, 0));
          expect(chart._currentEndDate).to.eql(new Date(1997, 6, 5, 23, 59, 0));
        });
      });
      context('when displayNavigationStep is set to seconds', function () {
        it('retreats the dates by a second', function () {
          timeline.setOption('displayNavigationStep', 'seconds');
          chart.previousPeriod();
          expect(chart._currentStartDate).to.eql(new Date(1996, 6, 5, 23, 59, 59));
          expect(chart._currentEndDate).to.eql(new Date(1997, 6, 5, 23, 59, 59));
        });
      });
    });
  });

  describe('#scale', function () {
    it('returns d3.time.seconds if set to "seconds"', function () {
      timeline.setOption('displayScale', 'seconds');
      expect(chart.scale()).to.equal(d3.time.seconds);
    });
    it('returns d3.time.minutes if set to "minutes"', function () {
      timeline.setOption('displayScale', 'minutes');
      expect(chart.scale()).to.equal(d3.time.minutes);
    });
    it('returns d3.time.hours if set to "hours"', function () {
      timeline.setOption('displayScale', 'hours');
      expect(chart.scale()).to.equal(d3.time.hours);
    });
    it('returns d3.time.days if set to "days"', function () {
      timeline.setOption('displayScale', 'days');
      expect(chart.scale()).to.equal(d3.time.days);
    });
    it('returns d3.time.weeks if set to "weeks"', function () {
      timeline.setOption('displayScale', 'weeks');
      expect(chart.scale()).to.equal(d3.time.weeks);
    });
    it('returns d3.time.months if set to "months"', function () {
      timeline.setOption('displayScale', 'months');
      expect(chart.scale()).to.equal(d3.time.months);
    });
    it('returns d3.time.days if set to "years"', function () {
      timeline.setOption('displayScale', 'years');
      expect(chart.scale()).to.equal(d3.time.years);
    });
  });

});