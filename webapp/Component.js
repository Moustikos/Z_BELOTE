/*****************************************************************************************************************
* File description         : The component file contains the application initialization logic
* Modification description : MOUSTIKOS - 19.04.2020 - Creation - Add firebase initialization                                 
*****************************************************************************************************************/

sap.ui.define(["sap/ui/core/UIComponent", "com/belote/util/Firebase"], function (UIComponent, Firebase) {
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

			// Initialize firebase connection
			Firebase.initializeFirebase();
			
			// Initialize local model
			this.setModel(new sap.ui.model.json.JSONModel({
				"isUserRegistered": false,
				"isAdmin" : false,
				"playerTurn" : "1",
				"player1Card" : "",
				"player2Card" : "",
				"player3Card" : "",
				"player4Card" : "",
				"distributor" : "1",
				"ETPlayers" : {},
				"ETTables" : {}
			}), "localModel");
		}
	});
});