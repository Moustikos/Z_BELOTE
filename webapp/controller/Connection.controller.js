/*****************************************************************************************************************
* File description         : The connection controller contains all functions called in connection view
* Modification description : MOUSTIKOS - 19.04.2020 - Creation                                    
*****************************************************************************************************************/

sap.ui.define(["com/belote/controller/BaseController"], function (BaseController) {
	"use strict";

	return BaseController.extend("com.belote.controller.Connection", {
		onInit: function () {
			this._initializeFirebaseWatch(this);
		},
		
		// Triggered when the user registers
		onRegister: function () {
			firebase.auth().createUserWithEmailAndPassword(this.byId("idInputEmailUser").getValue(), this.byId("idInputPasswordUser").getValue())
				.catch(function (error) {
					sap.m.MessageToast.show(error.message, {
						width: "40rem"
					});
				});
			this.byId("idInputEmailUser").setValue("");
			this.byId("idInputPasswordUser").setValue("");
		},

		// Triggered when the user logs in
		onLogin: function () {
			firebase.auth().signInWithEmailAndPassword(this.byId("idInputEmailUser").getValue(), this.byId("idInputPasswordUser").getValue()).catch(
				function (error) {
					sap.m.MessageToast.show(error.message, {
						width: "40rem"
					});
				});
			this.byId("idInputEmailUser").setValue("");
			this.byId("idInputPasswordUser").setValue("");
		},
		
		// Triggered when the user updates his/her displayed name
		onUpdateUserName: function () {
			firebase.auth().currentUser.updateProfile({
				displayName: this.byId("idUpdateUsername").getValue()
			});

			this._oUserPopup.close();
		}
	});
});