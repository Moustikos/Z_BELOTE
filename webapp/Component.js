/*****************************************************************************************************************
* File description         : The component file contains the application initialization logic
* Modification description : MOUSTIKOS - 19.04.2020 - Creation - Add firebase initialization                                 
*****************************************************************************************************************/

sap.ui.define(["sap/ui/core/UIComponent", "com/belote/util/Firebase", "com/belote/model/models"], function (UIComponent, Firebase, models) {
	"use strict";

	return UIComponent.extend("com.belote.Component", {
		metadata: {
			manifest: "json"
		},
		
		init: function () {
			// Call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// Enable routing
			this.getRouter().initialize();
			
			// Set the device model
			this.setModel(models.createDeviceModel(), "device");

			// Initialize firebase connection
			Firebase.initializeFirebase();
			
			// Initialize local model
			this.setModel(new sap.ui.model.json.JSONModel({
				"isUserRegistered": false,
				"isAdmin" : false
			}), "localModel");
			
			// Add custom icons
			sap.ui.core.IconPool.addIcon('coeur', 'customfont', 'icomoon', 'e9da');
			sap.ui.core.IconPool.addIcon('carreau', 'customfont', 'icomoon', 'e919');
			sap.ui.core.IconPool.addIcon('trefle', 'customfont', 'icomoon', 'e918');
			sap.ui.core.IconPool.addIcon('pique', 'customfont', 'icomoon', 'e917');
			
			sap.ui.Device.orientation.attachHandler(function(evt) {
		      this.getModel("device").setProperty("/orientation/portrait", !evt.landscape);
			}.bind(this));
		}
	});
});