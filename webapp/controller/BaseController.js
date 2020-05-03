/*****************************************************************************************************************
* File description         : The base controller contains functions that are called from different views
* Modification description : MOUSTIKOS - 19.04.2020 - Creation                                    
*****************************************************************************************************************/

sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/core/UIComponent", "com/belote/util/bindFirebase", "com/belote/util/Formatter", "com/belote/util/Util"],
function (Controller, UIComponent, BindFirebase, Formatter, Util) {
	"use strict";
// test quentin
	return Controller.extend("com.belote.controller.BaseController", {
		formatter: Formatter,
		util : Util,
		bindFireBase : BindFirebase,
		
		// Get router
		_getRouter : function() {
			return UIComponent.getRouterFor(this);
		},
		
		// Initilize firebase watch functions
		_initializeFirebaseWatch : function(that) {
			BindFirebase._initialize(that);
		},
		
		// Triggered when the user updates his/her displayed name
		onUpdateUserName: function () {
			if (this.byId("idUpdateUsername").getValue() !== "" && this.byId("idUpdateUsername").getValue() !== undefined) {
			firebase.auth().currentUser.updateProfile({
				displayName: this.byId("idUpdateUsername").getValue()
			});
			this._oUserPopup.close();
			this._getRouter().navTo("Tables");
			} else {
				sap.m.MessageToast.show("Please enter a user name");
			}
		}
	});
});