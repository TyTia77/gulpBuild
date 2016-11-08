"use strict";var test=222,MILLIS_PER_HOUR=36e5;JobList=Polymer({is:"rc-job-list",properties:{_filteredJobs:{type:Array,value:function(){return[]}},jobs:{type:Array,value:function(){return[]}},selectedJobs:{type:Object},fields:{type:Array,observer:"_handleFieldsChanged",value:function(){return[]}},opened:{type:Boolean,reflectToAttribute:!0,value:!1,notify:!0},tooltipActions:Object,_activeFilter:{type:Object,value:null},_previousFields:{type:Array},_columnStyles:{type:Array,value:function(){return[]}},_fixedColumns:{type:Boolean,value:!1},_textMeasurementContext:{type:Object,value:document.createElement("canvas").getContext("2d")}},observers:["_handleFieldSplices(fields.splices)","_onJobsChanged(jobs.*, _activeFilter)"],attached:function(){this.$.tooltip.bounds=this.$["list-body-container"]},notifyResize:function(){this.$["list-body"].notifyResize()},notifyJobUpdated:function(e,t){var n=this.jobs.findIndex(function(t){return t.rcJobId===e.rcJobId});n===-1?this.push("jobs",e):this.set("jobs."+n,e)},setFilter:function(e){this._activeFilter=null,this._activeFilter=e},_onRowMouseover:function(e){e.target.draggable=!0},_onRowMouseout:function(e){e.target.draggable=!1},_onRowDragstart:function(e){var t=e.currentTarget.job,n=MILLIS_PER_HOUR;if(void 0!==t.startDate&&void 0!==t.endDate){var o=new Date(t.startDate),i=new Date(t.endDate);n=i-o}var r={type:"job",fwId:t.fwId,jobId:t.rcJobId,custJobId:t.custJobId,duration:n,xOffset:0};e.dataTransfer.setData("text",JSON.stringify(r))},_getFieldValue:function(e,t){var n=t.key;return e[n]},_getClassForIndex:function(e){return e%2==0?"even-row":"odd-row"},_disableColumnFlex:function(){if(!this._fixedColumns){for(var e=this.querySelectorAll(".header-cell"),t=0;t<e.length;t++){var n=e[t];this.set("_columnStyles."+t+".width",n.offsetWidth+"px")}this._fixedColumns=!0}},_handleResizeDrag:function(e){var t=e.detail.target,n=t.dataset.columnIndex;this.set("_columnStyles."+n+".width",t.style.width)},_handleRowMouseDown:function(e){var t,n=e.currentTarget,o=this.$.tooltip;o.hide();var i=function(){return document.removeEventListener("mouseup",i),n.addEventListener("dragstart",i),this.$["list-body"].toggleSelectionForItem(n.job),clearInterval(t),!1}.bind(this);document.addEventListener("mouseup",i),n.addEventListener("dragstart",i),t=setTimeout(function(){document.removeEventListener("mouseup",i),n.addEventListener("dragstart",i),o.anchor=n,o.job=n.job,o.clientPosition={x:e.clientX,y:e.clientY},o.show(),e.stopPropagation()}.bind(this),1e3)},_onIronListScroll:function(e){var t=document.querySelector("#list-header-row"),n=this.$["list-body"];t.scrollLeft=n.scrollLeft,this.$.tooltip.opened=!1},_getArrowImageForOpenedState:function(e){return this.resolveUrl("./assets/images/greyArrow_"+(e?"down":"up")+".png")},_handleCollapseTapped:function(){this.opened=!this.opened},_getClassForFixedColumnState:function(e){return e?"fixed":""},_getColumnWidth:function(e,t){return e?t:"auto"},_injectColumnWidth:function(e,t){var n="column-"+e+"-width-style",o=this.querySelector("#"+n);if(null===o){o=document.createElement("style"),o.id=n;var i=this.querySelector("#column-width-styles");i.appendChild(o)}o.innerHTML=".list-cell.column-"+e+"{ width: "+t+";}"},_refreshColumnStyles:function(){void 0===this._columnStyles&&(this._columnStyles=[]);for(var e=this._columnStyles.length;e<this.fields.length;e++)this.push("_columnStyles",{width:"auto"})},_handleFieldsChanged:function(e){this._refreshColumnStyles()},_handleFieldSplices:function(e){void 0!==e&&this._refreshColumnStyles()},_onJobsChanged:function(e,t){if("jobs"===e.path)this.set("_filteredJobs",[]),this._processJobAddedSet(e.value,t);else if("jobs.splices"===e.path){for(var n=[],o=[],i=0,r=e.value.indexSplices.length;i<r;i++){var s=e.value.indexSplices[i];if(s.addedCount>0){var l=s.object.slice(s.index,s.index+s.addedCount);n=n.concat(l)}o=o.concat(s.removed)}this._processJobAddedSet(n,t),this._processJobDeletionSet(o)}else e.path.indexOf("jobs.#")!==-1&&this._processJobChanged(e.value,t)},_processJobAddedSet:function(e,t){for(var n=0,o=e.length;n<o;n++){var i=e[n],r=(this._getFilteredJobIndex(i.rcJobId),!t||t.query.isMatching(i));r&&this.push("_filteredJobs",i)}},_processJobChanged:function(e,t){var n=this._getFilteredJobIndex(e.rcJobId),o=!t||t.query.isMatching(e);n!==-1?o?this.set("_filteredJobs."+n,e):this.splice("_filteredJobs",n,1):o&&this.push("_filteredJobs",e)},_processJobDeletionSet:function(e){for(var t=0,n=e.length;t<n;t++){var o=e[t],i=this._getFilteredJobIndex(o.rcJobId);i!==-1&&this.splice("_filteredJobs",i,1)}},_getFilteredJobIndex:function(e){for(var t=0,n=this._filteredJobs.length;t<n;t++)if(this._filteredJobs[t].rcJobId===e)return t;return-1},_getColumnClassForIndex:function(e){return e===this.fields.length-1?"last":""},_handleResizeHandleCreated:function(e){var t=e.detail,n=t.parentElement,o=n.dataset.columnIndex,i=this.fields[o].key;t.addEventListener("dblclick",function(){var e=this._getLargestCellWidth(i),t=2;e+=t,this._disableColumnFlex(),this.set("_columnStyles."+o+".width",e),n.style.width=e+"px"}.bind(this))},_getLargestCellWidth:function(e){var t=this.querySelector(".body-cell.list-cell-text"),n=window.getComputedStyle(t),o=n.getPropertyValue("font-family"),i=n.getPropertyValue("font-size"),r=i+" "+o;this._textMeasurementContext.font=r;var s=this._getLargestTextWidthForField(e),l=parseInt(n.getPropertyValue("padding-left")),a=parseInt(n.getPropertyValue("padding-right")),d=parseInt(n.getPropertyValue("margin-left")),u=parseInt(n.getPropertyValue("margin-right")),c=parseInt(n.getPropertyValue("border-left-width")),h=parseInt(n.getPropertyValue("border-right-width")),f=s+(l+a)+(d+u)+(c+h);return f},_getLargestTextWidthForField:function(e){for(var t=0,n=0;n<this.jobs.length;n++){var o=this.jobs[n],i=o[e],r=this._textMeasurementContext.measureText(i).width;r>t&&(t=r)}return t}});var PI=3.14154334;console.log(PI);