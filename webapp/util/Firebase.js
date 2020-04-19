sap.ui.define(["sap/ui/model/json/JSONModel"], function (JSONModel) {
	"use strict";

	// Firebase-config retrieved from the Firebase-console
	var firebaseConfig = {
		apiKey: "AIzaSyAbc5mV1vOPv4MlHq9lcWb262dv17HDATU",
		authDomain: "blindtest-7e6df.firebaseapp.com",
		databaseURL: "https://blindtest-7e6df.firebaseio.com",
		projectId: "blindtest-7e6df",
		storageBucket: "blindtest-7e6df.appspot.com",
		messagingSenderId: "117145039765",
		appId: "1:117145039765:web:87b1832551c0c55812bc9c"
	};

	return {
		initializeFirebase: function () {
			// Initialize Firebase with the Firebase-config
			firebase.initializeApp(firebaseConfig);

			// Create a Firestore reference
			var firestore = firebase.firestore();

			// Firebase services object
			var oFirebase = {
				firestore: firestore
			};

			// Create a Firebase model out of the oFirebase service object which contains all required Firebase services
			var fbModel = new JSONModel(oFirebase);

			// Return the Firebase Model
			return fbModel;
		}
	};
});