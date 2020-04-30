/*****************************************************************************************************************
* File description         : The formatter contains all functions used to dynamically calculate values
* Modification description : MOUSTIKOS - 19.04.2020 - Creation                                    
*****************************************************************************************************************/

"use strict";
jQuery.sap.declare("com.belote.util.ClassFormatter");
jQuery.sap.setObject("com.belote.util.ClassFormatter", {
    getCardColor : function(sCardName) {
    	var sReturn = "";
    	this.getParent().getParent().removeStyleClass("Redcard");
    	this.getParent().getParent().removeStyleClass("Blackcard");
    	if(sCardName) {
    		sReturn = sCardName.split("-")[0].toLowerCase();
    	}
    	
    	if(sReturn === "carreau" || sReturn === "coeur") {
    		this.getParent().getParent().addStyleClass("Redcard");
    	} else if(sReturn === "pique" || sReturn === "trefle") {
    		this.getParent().getParent().addStyleClass("Blackcard");
    	}
    	
    	return "sap-icon://customfont/" + sReturn;
    },
    
    getCurrentPlayerNameAnimation : function(sName, sCurrentPlayer) {
    	if(sName === sCurrentPlayer) {
			this.addStyleClass("currentPlayer");
    	} else {
    		this.removeStyleClass("currentPlayer");
    	}
    	return sName;
    }
});