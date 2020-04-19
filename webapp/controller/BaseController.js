/*****************************************************************************************************************
* File description         : The base controller contains functions that are called from different views
* Modification description : MOUSTIKOS - 19.04.2020 - Creation                                    
*****************************************************************************************************************/

sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/core/UIComponent", "com/belote/util/bindFirebase", "com/belote/util/Formatter"],
function (Controller, UIComponent, BindFirebase, Formatter) {
	"use strict";

	return Controller.extend("com.belote.controller.BaseController", {
		formatter: Formatter,
		
		// Get router
		_getRouter : function() {
			return UIComponent.getRouterFor(this);
		},
		
		// Initilize firebase watch functions
		_initializeFirebaseWatch : function(that) {
			BindFirebase._initialize(that);
		}
	});
});