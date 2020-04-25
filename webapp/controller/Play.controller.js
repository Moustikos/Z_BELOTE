/*****************************************************************************************************************
* File description         : The connection controller contains all functions called in connection view
* Modification description : MOUSTIKOS - 19.04.2020 - Creation                                    
*****************************************************************************************************************/

sap.ui.define(["com/belote/controller/BaseController"], function (BaseController) {
	"use strict";

	return BaseController.extend("com.belote.controller.Connection", {
		onInit: function () {
			// Attach functions to entityset changes
			this._initializeFirebaseWatch(this);
			
			// Add onRouteMathed
			this._getRouter().getRoute("Play").attachPatternMatched(this._onRouteMatched, this);
		},
		
		_onRouteMatched : function() {
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
			
			// Update player entityset
			if(this.getView().getModel("localModel")) {
				this.getView().getModel("localModel").setProperty("/ETPlayers", {
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
				});
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