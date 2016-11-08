var MILLIS_PER_HOUR = 3600000;

    JobList = Polymer(
    {
      is: "rc-job-list",

      properties:
      {
        _filteredJobs: {
            type: Array,
            value: function() { return []; }
        },
        jobs: {
            type: Array,
            value: function() { return []; }
        },
        selectedJobs : {
        	type : Object // will always be an array, but is bound to an Object property in the iron-list
        },
        fields:
        {
          type: Array,
          observer : "_handleFieldsChanged",
          value: function() {return [];}
        },
       	opened:
    	{
       	  type: Boolean,
       	  reflectToAttribute: true,
       	  value: false,
       	  notify : true
       	},
       	tooltipActions : Object,
        _activeFilter: {
        	type: Object,
        	value: null
        },
        _previousFields : {
        	type : Array // keep track of the previous value of the 'fields' property so that we can determine if a new request is necessary when the array is replaced
        },
       	_columnStyles : { // array of property-value pairs
       		type : Array,
       		value : function() { return []; }
       	},
       	_fixedColumns : {
       		type : Boolean,
       		value : false
       	},

       	_textMeasurementContext : { // holds a 2D context that can be used for text measurement operations
       		type : Object,
       		value : document.createElement("canvas").getContext("2d") // shares one instance across all rc-job-lists
       	}
      },
      // listen to both new instances of the fields array, and modifications to the existing fields array
      observers : [
            "_handleFieldSplices(fields.splices)",
            "_onJobsChanged(jobs.*, _activeFilter)"

      ],
      attached : function() {
    	this.$.tooltip.bounds = this.$["list-body-container"];
      },

      notifyResize : function()
      {
		  this.$["list-body"].notifyResize();
      },

      notifyJobUpdated : function(updatedJob, jobBeforeUpdate) {
    	  var jobIndex = this.jobs.findIndex(function(job){
    		 return job.rcJobId === updatedJob.rcJobId;
    	  });

    	  // TODO: assert that the job still matches the query and filter,
    	  // or has started to match because of the update
    	  if (jobIndex === -1) {
    		  this.push("jobs", updatedJob);
    	  }
    	  else {
    		  this.set("jobs." + jobIndex, updatedJob);
    	  }
      },

	  setFilter: function(filter) {
	   	  // Force the dirty check of other templates by setting the filter to an empty object.
	      this._activeFilter = null;
	      this._activeFilter = filter;
	  },

      _onRowMouseover : function(ev)
      {
    	  ev.target.draggable = true;
      },
      _onRowMouseout : function(ev)
      {
    	  ev.target.draggable = false;
      },
      _onRowDragstart : function(ev)
      {
    	  var job = ev.currentTarget.job;
    	  var duration = MILLIS_PER_HOUR;
    	  if (job.startDate !== undefined && job.endDate !== undefined)
    	  {
    		  var startDate = new Date(job.startDate);
    		  var endDate = new Date(job.endDate);
    		  duration = endDate - startDate;
   		  }

    	  var payload = {
   			  type : "job",
   			  fwId : job.fwId,
   			  jobId : job.rcJobId,
   			  custJobId: job.custJobId,
   			  duration : duration,
   			  xOffset : 0
    	  };

    	  ev.dataTransfer.setData("text", JSON.stringify(payload));
      },
      _getFieldValue : function(obj, field)
      {
    	var fieldKey = field["key"];
       	return obj[fieldKey];
      },
	  _getClassForIndex : function(index)
	  {
		return (index % 2 == 0? "even-row" : "odd-row");
	  },
      _disableColumnFlex : function()
      {
   		  // The first time a column is resized, all column widths need to be fixed so that they move instead
   		  // of shrinking as the column grows.
    	  if (!this._fixedColumns)
   		  {
    		  // Initialise the existing columns with their current width, then remove the flex
	    	  var headerCells = this.querySelectorAll(".header-cell");
    		  for (var i = 0; i < headerCells.length; i++)
   			  {
   			  	var currentHeader = headerCells[i];
				this.set("_columnStyles." + i + ".width", currentHeader.offsetWidth + "px");
   			  }

    		  this._fixedColumns = true;
   		  }
		},
		_handleResizeDrag : function(e)
		{
			// Update the entry in the column styles array to refresh the binding in the template
			var headerCell = e.detail.target;
			var index = headerCell.dataset["columnIndex"];
			this.set("_columnStyles." + index + ".width", headerCell.style.width);
		},
		_handleRowMouseDown : function(ev)
		{
			var longPressTimer;
			var row = ev.currentTarget;
			var tooltip = this.$.tooltip;

			tooltip.hide();

			// If the user lifts the mouse before the long press ends, treat it as a selection
			var cancelHandler = function() {
				document.removeEventListener("mouseup", cancelHandler);
	    		row.addEventListener("dragstart", cancelHandler);
				this.$["list-body"].toggleSelectionForItem(row.job);
				clearInterval(longPressTimer);
				return false;
			}.bind(this);
    		document.addEventListener("mouseup", cancelHandler);
    		row.addEventListener("dragstart", cancelHandler);

			// If the long press ends without being cancelled, show the tool tip
			longPressTimer = setTimeout(function(){
				document.removeEventListener("mouseup", cancelHandler);
	    		row.addEventListener("dragstart", cancelHandler);
				tooltip.anchor = row;
				tooltip.job = row.job;
				tooltip.clientPosition = { x : ev.clientX, y : ev.clientY };
				tooltip.show();

				// Stop propogation of the event to prevent the "tap"
				// event firing after this has finished.
				ev.stopPropagation();
			}.bind(this), 1000);
		},

	  _onIronListScroll : function(ev)
      {
		  // Sync the header row with the columns if the iron list has been scrolled horizontally
    	  var headerRow = document.querySelector("#list-header-row"); // row is generated inside an if statement, so the reference is not stored by Polymer
    	  var listBody = this.$["list-body"];
    	  headerRow.scrollLeft = listBody.scrollLeft;

    	  // Close the tooltip to ensure the tooltip never can be mis-positioned
    	  this.$['tooltip'].opened = false;
      },
      _getArrowImageForOpenedState : function(opened)
      {
    	  return this.resolveUrl("./assets/images/greyArrow_" + (opened? "down" : "up") + ".png");
      },
      _handleCollapseTapped : function()
      {
    	  this.opened = !this.opened;
      },
      _getClassForFixedColumnState : function(fixedColumns)
      {
    	 return (fixedColumns? "fixed" : "");
      },
      _getColumnWidth : function(fixedColumns, fixedWidth)
	  {
    	  return (fixedColumns? fixedWidth : "auto");
	  },
	  _injectColumnWidth : function(index, columnWidth)
	  {
		  var styleId = "column-" + index + "-width-style";
		  var widthStyle = this.querySelector("#" + styleId);
		  if (widthStyle === null)
		  {
			  widthStyle = document.createElement("style");
			  widthStyle.id = styleId;
			  var styleContainer = this.querySelector("#column-width-styles");
			  styleContainer.appendChild(widthStyle);
		  }

		  widthStyle.innerHTML = ".list-cell.column-" + index + "{ width: " + columnWidth + ";}";
	  },
	  _refreshColumnStyles : function()
	  {
		  // We only need to ensure that there is an entry per field,
		  // so we don't need to observe what the modifications actually were,
		  // we can just iterate over all of the fields.
		  if (this._columnStyles === undefined)
		  {
			 this._columnStyles = [];
		  }

		  for (var i = this._columnStyles.length; i < this.fields.length; i++)
		  {
			  this.push("_columnStyles", {"width" : "auto"});
		  }
	  },
	  _handleFieldsChanged : function(fields)
	  {
		  this._refreshColumnStyles();
	  },
	  _handleFieldSplices : function(fieldSplices)
	  {
		  if (fieldSplices !== undefined)
		  {
			  this._refreshColumnStyles();
		  }
	  },

	  _onJobsChanged: function(jobChangeSet, activeFilter) {
		  // The change set object can indicate whether only a sinlge
		  // or splice of objects has changed.
		  if (jobChangeSet.path === "jobs") {
			  // The job list changed entirely, so clear the current list and add the
			  // new ones to the bound jobs list.
			  this.set('_filteredJobs', []);
			  this._processJobAddedSet(jobChangeSet.value, activeFilter);

	  	  } else if (jobChangeSet.path === "jobs.splices") {
	  		  // Splices can contain adds and deletes.
	  		  var jobsToAdd = [];
			  var jobsToDelete = [];
			  // Iterates through the change sets and build up a list to add and remove.
			  for (var i = 0, len = jobChangeSet.value.indexSplices.length; i < len; i++) {
				  var indexSplice = jobChangeSet.value.indexSplices[i];
				  if (indexSplice.addedCount > 0) {
					  var addedJobs = indexSplice.object.slice(indexSplice.index,
					  	  indexSplice.index + indexSplice.addedCount);
					  jobsToAdd = jobsToAdd.concat(addedJobs);
				  }
				  jobsToDelete = jobsToDelete.concat(indexSplice.removed);
			  }
			  this._processJobAddedSet(jobsToAdd, activeFilter);
			  this._processJobDeletionSet(jobsToDelete);

		  } else if (jobChangeSet.path.indexOf("jobs.#") !== -1) {
			  // A single job changed.
			  this._processJobChanged(jobChangeSet.value, activeFilter);
		  }
	  },

	  _processJobAddedSet : function(jobs, activeFilter) {
		  // Iterate through the added jobs and push any that match the filter
		  // to the bound job set.
		  for (var i = 0, len = jobs.length; i < len; i++) {
			  var job = jobs[i];
			  var jobIndex = this._getFilteredJobIndex(job.rcJobId);
			  var matchesFilter = (!(activeFilter) || activeFilter.query.isMatching(job));
			  if (matchesFilter) {
				  this.push('_filteredJobs', job);
			  }
		  }
	  },

	  _processJobChanged : function(job, activeFilter) {
		  // This will process the given job and determine whether it
		  // should be added, updated or removed from the bound job set.
		  var jobIndex = this._getFilteredJobIndex(job.rcJobId);
		  var matchesFilter = (!(activeFilter) || activeFilter.query.isMatching(job));

		  // If the job already exists in the Job List...
		  if (jobIndex !== -1) {
			  // It will either need to be updated or removed.
			  if (matchesFilter) {
				  this.set('_filteredJobs.' + jobIndex, job);
			  } else {
				  this.splice('_filteredJobs', jobIndex, 1);
			  }
		  // If it doesn't exist in the Job List...
		  } else {
			  // ...and matches the filter it should be added.
			  if (matchesFilter) {
				  this.push('_filteredJobs', job);
			  }
		  }
	  },

	  _processJobDeletionSet: function(jobs) {
		  // Deletes the list of given jobs from the bound job set.
		  for (var i = 0, len = jobs.length; i < len; i++) {
			  var job = jobs[i];
			  var jobIndex = this._getFilteredJobIndex(job.rcJobId);
			  if (jobIndex !== -1) {
				  this.splice('_filteredJobs', jobIndex, 1);
			  }
		  }
	  },

	  _getFilteredJobIndex: function(rcJobId) {
		  for (var i = 0, len = this._filteredJobs.length; i < len; i++) {
			  if (this._filteredJobs[i].rcJobId === rcJobId) {
				  return i;
			  }
		  }
		  return -1;
	  },

	  _getColumnClassForIndex : function(index)
	  {
		  // The :last-of-type CSS selector is not matching correctly on IE 11, so we need to
		  // add a class that we can use as a replacement.
		  if (index === this.fields.length - 1)
		  {
			  return "last";
		  }

		  return "";
	  },

	  _handleResizeHandleCreated : function(ev) {
		  var handle = ev.detail;
		  var headerCell = handle.parentElement;
		  var columnIndex = headerCell.dataset["columnIndex"];
		  var fieldName = this.fields[columnIndex].key;

		  // Add a double-click listener that will set the column width
		  // to the width of the largest value in the column
		  handle.addEventListener("dblclick", function() {

			  var largestCellWidth = this._getLargestCellWidth(fieldName);

			  // TODO: the cell size calculations are currently off by a tiny amount
			  // which truncates the text on IE11, so we have to use a small buffer to
			  // prevent this. This buffer should be removed once the cause of the calculation
			  // error has been found.
			  var bufferSize = 2;
			  largestCellWidth += bufferSize;

			  // Disable the flex behaviour, then update the width rule for the corresponding
			  // column to match the width of the largest cell
			  this._disableColumnFlex();
			  this.set("_columnStyles." + columnIndex + ".width", largestCellWidth);

			  // The header cell width needs to be set independently, as the resize handle
			  // makes it have its own width property that overrides the rules on the CSS class
			  // that the body cells are following.
			  headerCell.style.width = largestCellWidth + "px";

		  }.bind(this));
	  },

	  _getLargestCellWidth : function(fieldName) {

		  // Select any of the cell text containers to read CSS properties from
		  var textCell = this.querySelector(".body-cell.list-cell-text");
		  var textStyles = window.getComputedStyle(textCell);

		  // Set the measurement context to use the same font properties as the cell text
		  var textFontFamily = textStyles.getPropertyValue("font-family");
		  var textFontSize = textStyles.getPropertyValue("font-size");
		  var textFont = textFontSize + " " + textFontFamily;
		  this._textMeasurementContext.font = textFont;

		  // Get the longest string value for the given field, and then apply it to the
		  // context to calculate the pixel width of the string.
		  var largestTextWidth = this._getLargestTextWidthForField(fieldName);

		  // Add on any additional CSS properties that will affect the final width
		  var paddingLeft = parseInt(textStyles.getPropertyValue("padding-left"));
		  var paddingRight = parseInt(textStyles.getPropertyValue("padding-right"));
		  var marginLeft = parseInt(textStyles.getPropertyValue("margin-left"));
		  var marginRight = parseInt(textStyles.getPropertyValue("margin-right"));
		  var borderLeft = parseInt(textStyles.getPropertyValue("border-left-width"));
		  var borderRight = parseInt(textStyles.getPropertyValue("border-right-width"));

		  var cellWidth = largestTextWidth
			  + (paddingLeft + paddingRight)
			  + (marginLeft + marginRight)
			  + (borderLeft + borderRight);

		  return cellWidth;
	  },

	  _getLargestTextWidthForField : function(fieldName) {
		  var largestTextWidth = 0;
		  for (var i = 0; i < this.jobs.length; i++) {
			  var currentJob = this.jobs[i];
			  var fieldTextValue = currentJob[fieldName];
			  var fieldTextWidth = this._textMeasurementContext.measureText(fieldTextValue).width;
			  if (fieldTextWidth > largestTextWidth) {
				  largestTextWidth = fieldTextWidth;
			  }
		  }
		  return largestTextWidth;
	  }

    });
