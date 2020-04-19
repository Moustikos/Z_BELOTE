sap.ui.define([], function() {
    "use strict";
    return {
        getConnectionScreenVisible : function(bIsConnected) {
            return !bIsConnected;
        },
        
        getGameScreenVisible : function(bIsConnected) {
            return bIsConnected;
        },
        
        getNonEmpty : function(sValue) {
        	return sValue !== "";
        }
    };
});