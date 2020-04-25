sap.ui.define(["com/belote/controller/BaseController"], function (BaseController) {
	"use strict";

	return BaseController.extend("com.belote.controller.TableDetails", {

		onInit: function () {
			this._initializeFirebaseWatch(this);
			this._getRouter().getRoute("TableDetails").attachPatternMatched(this._onRouteMatched, this);
		},
		
			_onRouteMatched: function () {
			var oModel = this.getView().getModel("localModel");
		
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.belote.view.TableDetails
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.belote.view.TableDetails
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.belote.view.TableDetails
		 */
		//	onExit: function() {
		//
		//	}

	});

});