/*****************************************************************************************************************
* File description         : The connection controller contains all functions called in connection view
* Modification description : MOUSTIKOS - 19.04.2020 - Creation                                    
*****************************************************************************************************************/
sap.ui.define(["com/belote/controller/BaseController"], function (BaseController) {
	"use strict";

	return BaseController.extend("com.belote.controller.Play", {
		onInit: function () {
			// Attach functions to entityset changes
			this._initializeFirebaseWatch(this);
			
			// Add onRouteMathed
			this._getRouter().getRoute("Play").attachPatternMatched(this._onRouteMatched, this);
		},
		
		_onRouteMatched : function() {
			//Initialize local variable
			this.isShuffleNeeded = true;
			
			// Add static path to the table locally
			this.bindFireBase._addUserTableEntityListener(this);
		},
        
        // Add logic to update local model
        _onTableEntityReceived : function(snapshot) {
            var oLocalModel = this.getView().getModel("localModel");
            oLocalModel.setProperty("/PlayTable", this.util._convertFirebaseToJSON(snapshot));
            
            // Only current player can shuffle cards
            if(this.isShuffleNeeded && oLocalModel.getProperty("/PlayTable/CurrentPlayer") === firebase.auth().currentUser.displayName) {
            	this.isShuffleNeeded = false;
            	this.util._shuffleCards(this, false);
            }
        },
        
        // Triggered if user accepts the suggested card
        onSuggestionSelected : function() {
        	var updates = {};
        	updates["/SuggestedCard"] = "";
        	updates["/Atout"] = this.getView().getModel("localModel").getProperty("/PlayTable/SuggestedCard").split("-")[0].toLowerCase();
        	updates["/Preneur"] = firebase.auth().currentUser.displayName;
        	firebase.database().ref("ETTableSet/0").update(updates);
        },
        
        // Triggered if the user rejects the suggestion card
        onSuggestionRejected : function() {
        	var sUserName = firebase.auth().currentUser.displayName;
        	var oLocalModel = this.getView().getModel("localModel");
        	var aPlayers = oLocalModel.getProperty("/PlayTable/NPlayers");
        	
        	for (var i = 0; i < aPlayers.length; i++) {
        		if(aPlayers[i].ID === sUserName) {
        			var iNextPlayerId = (i + 1) % 4;
        			var updates = {};
        			updates["/CurrentPlayer"] = aPlayers[iNextPlayerId].ID;
        			
        			if(oLocalModel.getProperty("/PlayTable/Distributor") === sUserName) {
        				updates["/DistributionTour"] = 2;
        			}
        			firebase.database().ref("ETTableSet/0").update(updates);
        			break;
        		}
        	}
        }, 
        
        // Triggered when the user clicks custom atout
        onPressCustomAsset : function(oEvent) {
        	var sUserName = firebase.auth().currentUser.displayName;
        	var aSplit = oEvent.getSource().getIcon().split("/");
        	var sChoice = aSplit[aSplit.length - 1];
        	var aPlayers = oLocalModel.getProperty("/PlayTable/NPlayers");
        	
        	var updates = {};
        	if(sChoice === "decline") {
        		for (var i = 0; i < aPlayers.length; i++) {
	        		if(aPlayers[i].ID === sUserName) {
	        			var iNextPlayerId = (i + 1) % 4;
	        			var updates = {};
	        			updates["/CurrentPlayer"] = aPlayers[iNextPlayerId].ID;
	        			
	        			if(oLocalModel.getProperty("/PlayTable/Distributor") === sUserName) {
	        				updates["/DistributionTour"] = 1;
	        				updates["/Distributor"] = aPlayers[iNextPlayerId].ID;
	        				updates["/CurrentPlayer"] = aPlayers[(iNextPlayerId + 1) % 4].ID;
	        				this.util._shuffleCards(this, false);
	        			}
	        			firebase.database().ref("ETTableSet/0").update(updates);
	        			break;
	        		}
	        	}
        	}
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
		},
		
		// Update team temporary score after each set of 4 cards
		_updateScore : function(aCards) {
			var iScore = 0;
			var iBestIndex = 0;
			var iCurrentIndex, oBestCard;
			var oScoreModel = this.getView().getModel("scoreModel");
			var oLocalModel = this.getView().getModel("localModel");
			
			// Calculate score and best card
			for (var i = 0; i < aCards.length; i++) {
				if(aCards[i].Name.split("/")[0] === oLocalModel.getProperty("/Atout")) {
					iCurrentIndex = oScoreModel.getProperty("/Atout/" + aCards[i].Name.split("/")[1] + "/Ranking");
					iScore = iScore + oScoreModel.getProperty("/Atout/" + aCards[i].Name.split("/")[1] + "/Points");
					
					if(iCurrentIndex > iBestIndex) {
						iBestIndex = iCurrentIndex;
						oBestCard = aCards[i];
					}
				} else if(aCards[i].Name.split("/")[0] === oLocalModel.getProperty("/CouleurDemandee")) {
					iCurrentIndex = oScoreModel.getProperty("/NonAtout/" + aCards[i].Name.split("/")[1] + "/Ranking");
					iScore = iScore + oScoreModel.getProperty("/NonAtout/" + aCards[i].Name.split("/")[1] + "/Points");
					
					if(iCurrentIndex > iBestIndex) {
						iBestIndex = iCurrentIndex;
						oBestCard = aCards[i];
					}
				} else {
					iCurrentIndex = oScoreModel.getProperty("/NonDemande/" + aCards[i].Name.split("/")[1] + "/Ranking");
					iScore = iScore + oScoreModel.getProperty("/NonDemande/" + aCards[i].Name.split("/")[1] + "/Points");
					
					if(iCurrentIndex > iBestIndex) {
						iBestIndex = iCurrentIndex;
						oBestCard = aCards[i];
					}
				}
			}
			
			// Update local model
			if(oBestCard.Player === "1" || oBestCard.Player === "3") {
				oLocalModel.setProperty("/TempScoreTeam1", oLocalModel.getProperty("/TempScoreTeam1") + iScore);
			} else {
				oLocalModel.setProperty("/TempScoreTeam2", oLocalModel.getProperty("/TempScoreTeam2") + iScore);
			}
			
			// If no card remaining, update the model with real score
			if(oLocalModel.getProperty("/RemainingCard") < 1) {
				var bIsCapot = false;
				var bIsFailed = false;
				oLocalModel.setProperty("/RemainingCard", 8);
				
				if(oLocalModel.getProperty("/TempScoreTeam1") === 0) {
					bIsCapot = true;
					oLocalModel.setProperty("/ScoreTeam2", oLocalModel.getProperty("/ScoreTeam2") + 250);
				}
				
				if(oLocalModel.getProperty("/TempScoreTeam2") === 0) {
					bIsCapot = true;
					oLocalModel.setProperty("/ScoreTeam1", oLocalModel.getProperty("/ScoreTeam1") + 250);
				}
				
				if(!bIsCapot) {
					
				}
			}
		}
	});
});