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
				apiKey: "AIzaSyDveJ9QTgFoW0KiKIdMcaff6m6LewjmoYo",
			    authDomain: "belote-a1e70.firebaseapp.com",
			    databaseURL: "https://belote-a1e70.firebaseio.com",
			    projectId: "belote-a1e70",
			    storageBucket: "belote-a1e70.appspot.com",
			    messagingSenderId: "451575044085",
			    appId: "1:451575044085:web:ac0ba8d8b5bcdf5ac172bc"
			});
		}
	};
});