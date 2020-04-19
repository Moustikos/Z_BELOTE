/*****************************************************************************************************************
* File description         : The connection controller contains all functions called in connection view
* Modification description : MOUSTIKOS - 19.04.2020 - Creation                                    
*****************************************************************************************************************/

sap.ui.define(["com/belote/controller/BaseController"], function (BaseController) {
	"use strict";

	return BaseController.extend("com.belote.controller.Connection", {
		onInit: function () {
			// // Attach functions to entityset changes
			this._initializeFirebaseWatch(this);
		},
		
		onPressPlay : function() {
			if (!this._oUserCardPopup) {
                this._oUserCardPopup = sap.ui.xmlfragment(this.getView().getId(), "com.belote.fragment.chooseCard", this);
                this.getView().addDependent(this._oUserCardPopup);
            }

            this._oUserCardPopup.open();
		},
		
		onSelectCard : function(oEvent) {
			var oModel = this.getView().getModel("localModel");
			var sBindingContext = oEvent.getSource().getBindingContext("localModel").getPath();
			oModel.setProperty("/player1Card", oModel.getProperty(sBindingContext + "/Name"));
			
			var sIndex = parseInt(sBindingContext.split("/")[sBindingContext.split("/").length - 1], 10);
			var sCards = oModel.getProperty("/ETPlayers/1/Cards");
			sCards.splice(sIndex, 1);
			oModel.setProperty("/ETPlayers/1/Cards", sCards);
			
			this._oUserCardPopup.close();
		}
	});
});