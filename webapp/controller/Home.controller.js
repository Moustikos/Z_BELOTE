sap.ui.define(["sap/ui/core/mvc/Controller", "com/belote/util/bindFirebase", "com/belote/util/Formatter"], function (Controller, BindFirebase, Formatter) {
	"use strict";

	return Controller.extend("com.belote.controller.Home", {
		formatter: Formatter,
		onInit: function () {
			// Create card array
			var aCard = [{"Name": "Coeur-7"}, {"Name": "Coeur-8"}, {"Name": "Coeur-9"}, {"Name": "Coeur-10"}, {"Name": "Coeur-V"}, {"Name": "Coeur-D"}, {"Name": "Coeur-R"}, {"Name": "Coeur-As"},
						 {"Name": "Carreau-7"}, {"Name": "Carreau-8"}, {"Name": "Carreau-9"}, {"Name": "Carreau-10"}, {"Name": "Carreau-V"}, {"Name": "Carreau-D"}, {"Name": "Carreau-R"}, {"Name": "Carreau-As"},
						 {"Name": "Trèfle-7"}, {"Name": "Trèfle-8"}, {"Name": "Trèfle-9"}, {"Name": "Trèfle-10"}, {"Name": "Trèfle-V"}, {"Name": "Trèfle-D"}, {"Name": "Trèfle-R"}, {"Name": "Trèfle-As"},
						 {"Name": "Pique-7"}, {"Name": "Pique-8"}, {"Name": "Pique-9"}, {"Name": "Pique-10"}, {"Name": "Pique-V"}, {"Name": "Pique-D"}, {"Name": "Pique-R"}, {"Name": "Pique-As"}];
						 
			var currentIndex = aCard.length;
			var temporaryValue, randomIndex;
		
			// While there remain elements to shuffle...
			while (0 !== currentIndex) {
				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;
		
				// And swap it with the current element.
				temporaryValue = aCard[currentIndex];
				aCard[currentIndex] = aCard[randomIndex];
				aCard[randomIndex] = temporaryValue;
			}
			
			// Initialize local model
			this.getView().setModel(new sap.ui.model.json.JSONModel({
				"isUserRegistered": false,
				"isAdmin" : false,
				"playerTurn" : "1",
				"player1Card" : "",
				"player2Card" : "",
				"player3Card" : "",
				"player4Card" : "",
				"distributor" : "1",
				"ETPlayers" : {
					"1" : {
						Name: "Rémi",
						Cards : aCard.splice(0,8)
					},
					"2" : {
						Name: "Quentin",
						Cards : aCard.splice(9,16)
					},
					"3" : {
						Name: "Jérémie",
						Cards : aCard.splice(17,24)
					},
					"4" : {
						Name: "Anne",
						Cards : aCard.splice(25,32)
					}
				}
			}), "localModel");

			// Attach functions to entityset changes
			BindFirebase._initialize(this);
		},
		
		// Triggered when the user registers
		onRegister: function () {
			firebase.auth().createUserWithEmailAndPassword(this.byId("idInputEmailUser").getValue(), this.byId("idInputPasswordUser").getValue())
				.catch(function (error) {
					sap.m.MessageToast.show(error.message, {
						width: "40rem"
					});
				});
			this.byId("idInputEmailUser").setValue();
			this.byId("idInputPasswordUser").setValue();
		},

		// Triggered when the user logs in
		onLogin: function () {
			firebase.auth().signInWithEmailAndPassword(this.byId("idInputEmailUser").getValue(), this.byId("idInputPasswordUser").getValue()).catch(
				function (error) {
					sap.m.MessageToast.show(error.message, {
						width: "40rem"
					});
				});
			this.byId("idInputEmailUser").setValue();
			this.byId("idInputPasswordUser").setValue();
		},
		
		// Triggered when the user updates his/her displayed name
		onUpdateUserName: function () {
			firebase.auth().currentUser.updateProfile({
				displayName: this.byId("idUpdateUsername").getValue()
			});

			this._oUserPopup.close();
		},
		
		onPressPlay : function() {
			if (!this._oUserCardPopup) {
                this._oUserCardPopup = sap.ui.xmlfragment(this.getView().getId(), "com.belote.fragment.chooseCard", this);
                this.getView().addDependent(this._oUserCardPopup);
            }

            this._oUserCardPopup.open();
		},
		
		onSelectCard : function(oEvent) {
			var oModel = this.getView().getModel("localModel");
			var sBindingContext = oEvent.getSource().getBindingContext("localModel").getPath();
			oModel.setProperty("/player1Card", oModel.getProperty(sBindingContext + "/Name"));
			
			var sIndex = parseInt(sBindingContext.split("/")[sBindingContext.split("/").length - 1], 10);
			var sCards = oModel.getProperty("/ETPlayers/1/Cards");
			sCards.splice(sIndex, 1);
			oModel.setProperty("/ETPlayers/1/Cards", sCards);
			
			this._oUserCardPopup.close();
		}
	});
});