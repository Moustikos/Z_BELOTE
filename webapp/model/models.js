/*****************************************************************************************************************
* Project                  : Fiori Unit - Training            
* File name                : model.js                              
* Company                  : SOPRASTERIA                                                
*-----------------------------------------------------------------------------------------------------------------
* File description         : The model file is used to declare models during Component initialization
* Modification description : RPRETRE - 19.02.2020 - Creation                                    
*****************************************************************************************************************/

sap.ui.define([ "sap/ui/model/json/JSONModel", "sap/ui/Device" ], function (JSONModel, Device) {
	"use strict";

	return {
		// Create model containing device information
		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		}
	};
});