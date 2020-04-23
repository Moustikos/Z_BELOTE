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
    		sReturn = sCardName.split("-")[0];
    	}
    	
    	if(sReturn === "Carreau" || sReturn === "Coeur") {
    		this.getParent().getParent().addStyleClass("Redcard");
    	} else if(sReturn === "Pique" || sReturn === "Trèfle") {
    		this.getParent().getParent().addStyleClass("Blackcard");
    	}
    	
    	return sReturn;
    }
});