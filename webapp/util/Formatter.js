/*****************************************************************************************************************
* File description         : The formatter contains all functions used to dynamically calculate values
* Modification description : MOUSTIKOS - 19.04.2020 - Creation                                    
*****************************************************************************************************************/
sap.ui.define([], function() {
    "use strict";
    return {
        getNonEmpty : function(sValue) {
        	return sValue !== "" && sValue !== undefined && sValue !== null;
        },
        
        getCardValue : function(sCardName) {
        	var sReturn = "";
        	if(sCardName) {
        		sReturn = sCardName.split("-")[1];
        	}
        	
        	return sReturn;
        },
        
        getSuggestCardEnabled : function(sPlayerName) {
        	var bReturn = false;
        	if(firebase.auth().currentUser) {
        		bReturn = sPlayerName === firebase.auth().currentUser.displayName;
        	}
        	
        	return bReturn;
        },
        
        getSuggestCardTakeVisible : function(iTour) {
        	return iTour === 1;
        },
        
        getCustomColorTakeVisible : function(iTour) {
        	return iTour === 2;
        }
    };
});