sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/belote/model/models",
	"com/belote/util/Firebase"
], function (UIComponent, Device, models, Firebase) {
	"use strict";

	return UIComponent.extend("com.belote.Component", {
		metadata: {
			manifest: "json"
		},
		
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
			// Set the firebase model by calling the initializeFirebase function in the Firebase.js file
			this.setModel(Firebase.initializeFirebase(), "firebase");
		}
	});
});