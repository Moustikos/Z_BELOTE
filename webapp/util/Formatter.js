/*****************************************************************************************************************
* File description         : The formatter contains all functions used to dynamically calculate values
* Modification description : MOUSTIKOS - 19.04.2020 - Creation                                    
*****************************************************************************************************************/

sap.ui.define([], function() {
    "use strict";
    return {
        getNonEmpty : function(sValue) {
        	return sValue !== "";
        }
    };
});