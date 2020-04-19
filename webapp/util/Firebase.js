/*****************************************************************************************************************
* File description         : The firebase file is used in the component file to initialize firebase
* Modification description : MOUSTIKOS - 19.04.2020 - Creation                                    
*****************************************************************************************************************/

sap.ui.define(["sap/ui/model/json/JSONModel"], function (JSONModel) {
	"use strict";
	return {
		initializeFirebase: function () {
			// Initialize Firebase with the Firebase-config
			firebase.initializeApp({
				apiKey: "AIzaSyAbc5mV1vOPv4MlHq9lcWb262dv17HDATU",
				authDomain: "blindtest-7e6df.firebaseapp.com",
				databaseURL: "https://blindtest-7e6df.firebaseio.com",
				projectId: "blindtest-7e6df",
				storageBucket: "blindtest-7e6df.appspot.com",
				messagingSenderId: "117145039765",
				appId: "1:117145039765:web:87b1832551c0c55812bc9c"
			});
		}
	};
});