/*****************************************************************************************************************
 * File description         : The connection controller contains all functions called in connection view
 * Modification description : MOUSTIKOS - 19.04.2020 - Creation                                    
 *****************************************************************************************************************/
sap.ui.define(["com/belote/controller/BaseController", "sap/ui/core/Fragment"], function (BaseController, Fragment) {
	"use strict";

	return BaseController.extend("com.belote.controller.Play", {
		onInit: function () {
			// Add onRouteMathed
			this._getRouter().getRoute("Play").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function (oEvent) {
			// Build binding path
			this._tablePath = oEvent.getParameter("arguments").teamPath.replace("-", "/");

			// Add static path to the table locally
			this.bindFireBase._addUserTableEntityListener(this);
		},

		// Add logic to update local model
		_onTableEntityReceived: function (snapshot) {
			var oLocalModel = this.getView().getModel("localModel");
			oLocalModel.setProperty("/PlayTable", this.util._convertFirebaseToJSON(snapshot, this));

			// Only current player can shuffle cards
			if (oLocalModel.getProperty("/PlayTable/IsShuffleNeeded") && oLocalModel.getProperty("/PlayTable/Distributor") === firebase.auth().currentUser
				.displayName) {
				this.util._shuffleCards(this);
			}
		},

		_openChooseCard: function () {
			var oItemTemplate = sap.ui.xmlfragment(this.getView().getId(), "com.belote.fragment.chooseCardVBox", this);
			var sUserName = firebase.auth().currentUser.displayName;
			var oLocalModel = this.getView().getModel("localModel");
			var aPlayers = oLocalModel.getProperty("/PlayTable/NPlayers");
			var sPath = "/PlayTable/NPlayers/";

			if (!this._oUserCardPopup) {
				this._oUserCardPopup = sap.ui.xmlfragment(this.getView().getId(), "com.belote.fragment.chooseCard", this);
				this.getView().addDependent(this._oUserCardPopup);
			}

			for (var i = 0; i < aPlayers.length; i++) {
				if (aPlayers[i].Name === sUserName) {
					sPath = sPath + i + "/NCards";
				}
			}

			this.byId("idHBoxChooseCard").bindAggregation("items", {
				path: sPath,
				model: "localModel",
				template: oItemTemplate,
				templateShareable: true
			});

			this._oUserCardPopup.open();
		},

		// Triggered if user accepts the suggested card
		onSuggestionSelected: function () {
			var updates = {};
			updates["/SuggestedCard"] = "";
			updates["/Atout"] = this.getView().getModel("localModel").getProperty("/PlayTable/SuggestedCard").split("-")[0].toLowerCase();
			updates["/Preneur"] = firebase.auth().currentUser.displayName;
			updates["/DoneFinished"] = true;
			this._distributeRemainingCards(updates);
			firebase.database().ref(this._tablePath).update(updates);
		},

		// Distribute remaining cards
		_distributeRemainingCards: function (updates) {
			var sUserName = firebase.auth().currentUser.displayName;
			var oLocalModel = this.getView().getModel("localModel");
			var aPlayers = oLocalModel.getProperty("/PlayTable/NPlayers");
			var aRemainingCards = oLocalModel.getProperty("/PlayTable/NRemainingCards");
			var sCurrentPlayer = oLocalModel.getProperty("/PlayTable/CurrentPlayer");
			var sSuggestedCard = oLocalModel.getProperty("/PlayTable/SuggestedCard");
			var aSortedPlayers = oLocalModel.getProperty("/PlayTable/NOrdererPlayers");
			var iPreneur;
			var iRemainingCardIndex = 0;

			for (var j = 0; j < aSortedPlayers.length; j++) {
				if (aSortedPlayers[j].Name === sUserName) {
					updates["/NPlayers/" + aSortedPlayers[j].ID + "/NCards/" + 5] = {
						Name: sSuggestedCard,
						ID: 5
					};
					updates["/NPlayers/" + aSortedPlayers[j].ID + "/NCards/" + 6] = {
						Name: aRemainingCards[iRemainingCardIndex].Name,
						ID: 6
					};

					iRemainingCardIndex = iRemainingCardIndex + 1;

					updates["/NPlayers/" + aSortedPlayers[j].ID + "/NCards/" + 7] = {
						Name: aRemainingCards[iRemainingCardIndex].Name,
						ID: 7
					};

					iRemainingCardIndex = iRemainingCardIndex + 1;
				} else {
					updates["/NPlayers/" + aSortedPlayers[j].ID + "/NCards/" + 5] = {
						Name: aRemainingCards[iRemainingCardIndex].Name,
						ID: 5
					};

					iRemainingCardIndex = iRemainingCardIndex + 1;

					updates["/NPlayers/" + aSortedPlayers[j].ID + "/NCards/" + 6] = {
						Name: aRemainingCards[iRemainingCardIndex].Name,
						ID: 6
					};

					iRemainingCardIndex = iRemainingCardIndex + 1;

					updates["/NPlayers/" + aSortedPlayers[j].ID + "/NCards/" + 7] = {
						Name: aRemainingCards[iRemainingCardIndex].Name,
						ID: 7
					};

					iRemainingCardIndex = iRemainingCardIndex + 1;
				}
			}
		},

		// Triggered if the user rejects the suggestion card
		onSuggestionRejected: function () {
			var sUserName = firebase.auth().currentUser.displayName;
			var oLocalModel = this.getView().getModel("localModel");
			var aPlayers = oLocalModel.getProperty("/PlayTable/NPlayers");

			for (var i = 0; i < aPlayers.length; i++) {
				if (aPlayers[i].Name === sUserName) {
					var iNextPlayerId = (i + 1) % 4;
					var updates = {};
					updates["/CurrentPlayer"] = aPlayers[iNextPlayerId].Name;

					if (oLocalModel.getProperty("/PlayTable/Distributor") === sUserName) {
						updates["/DistributionTour"] = 2;
					}
					firebase.database().ref(this._tablePath).update(updates);
					break;
				}
			}
		},

		// Triggered when the user clicks custom atout
		onPressCustomAsset: function (oEvent) {
			var sUserName = firebase.auth().currentUser.displayName;
			var aSplit = oEvent.getSource().getIcon().split("/");
			var sChoice = aSplit[aSplit.length - 1];
			var oLocalModel = this.getView().getModel("localModel");
			var aPlayers = oLocalModel.getProperty("/PlayTable/NPlayers");

			var updates = {};
			if (sChoice === "decline") {
				for (var i = 0; i < aPlayers.length; i++) {
					if (aPlayers[i].Name === sUserName) {
						var iNextPlayerId = (i + 1) % 4;
						var updates = {};
						updates["/CurrentPlayer"] = aPlayers[iNextPlayerId].Name;

						if (oLocalModel.getProperty("/PlayTable/Distributor") === sUserName) {
							updates["/DistributionTour"] = 1;
							updates["/Distributor"] = aPlayers[iNextPlayerId].Name;
							updates["/CurrentPlayer"] = aPlayers[(iNextPlayerId + 1) % 4].Name;
							updates["/IsShuffleNeeded"] = true;
						}
						firebase.database().ref(this._tablePath).update(updates);
						break;
					}
				}
			} else {
				updates["/SuggestedCard"] = "";
				updates["/Atout"] = sChoice.toLowerCase();
				updates["/Preneur"] = firebase.auth().currentUser.displayName;
				this._distributeRemainingCards(updates);
				firebase.database().ref(this._tablePath).update(updates);
			}
		},

		onSelectCard: function (oEvent) {
			var oModel = this.getView().getModel("localModel");
			var iRemaningCardsBeforeThisTurn = oModel.getProperty('/PlayTable/NOrdererPlayers/0/NCards').length
			var oMasterPlayer = oModel.getProperty("/PlayTable/MasterPlayer");
			var sPlayerName = firebase.auth().currentUser.displayName;
			if (oModel.getProperty("/PlayTable/CurrentPlayer") === firebase.auth().currentUser.displayName) {
				var iPlayerIndex = oModel.getProperty("/PlayTable/NOrdererPlayers/0/ID");
				var sCardName = oModel.getProperty(oEvent.getSource().getBindingContext("localModel").getPath()).Name;
				var updates = {};

				//clear table in case of new turn
				if (sPlayerName === oMasterPlayer.Name) {
					firebase.database().ref(this._tablePath + "/Player0Card").remove();
					firebase.database().ref(this._tablePath + "/Player1Card").remove();
					firebase.database().ref(this._tablePath + "/Player2Card").remove();
					firebase.database().ref(this._tablePath + "/Player3Card").remove();
				}

				updates["/Player" + iPlayerIndex + "Card"] = sCardName;
				updates["/CurrentPlayer"] = oModel.getProperty("/PlayTable/NOrdererPlayers/1/Name");
				firebase.database().ref(this._tablePath + "/NPlayers/" + iPlayerIndex + "/NCards/" + oModel.getProperty(oEvent.getSource().getBindingContext(
					"localModel").getPath()).ID).remove();
				firebase.database().ref(this._tablePath).update(updates);

				//define the master
				var sRequestor = oModel.getProperty("/PlayTable/Requestor");
				if (sPlayerName === sRequestor) {
					var sRequestedColor = this.util._getCardSymbol(sCardName);
					firebase.database().ref(this._tablePath).update({
						RequestedColor: sRequestedColor
					});
					oModel.setProperty("/PlayTable/RequestedColor", sRequestedColor);
				}
				oModel.setProperty("/PlayTable/Player" + iPlayerIndex + "Card", sCardName);

				this.setMasterPlayer(iRemaningCardsBeforeThisTurn);
			} else {
				sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("NotYourTurn"));
			}

		},

		setMasterPlayer: function (iRemaningCardsBeforeThisTurn) {
			var oModel = this.getView().getModel("localModel");
			var sAtout = oModel.getProperty("/PlayTable/Atout");
			var sRequestedColor = oModel.getProperty("/PlayTable/RequestedColor");
			var aCardsPlayed = [];
			var oMasterPlayer = {};
			var oScoreModel = this.getView().getModel("scoreModel");
			var NPlayers = oModel.getProperty("/PlayTable/NPlayers");
			//retrieve list of played cards
			for (var i = 0; i < 4; i++) {
				var sCardName = oModel.getProperty("/PlayTable/Player" + i + "Card");
				if (sCardName) {
					var sCardValue = this.util._getCardValue(sCardName);
					var sCardSymbol = this.util._getCardSymbol(sCardName);
					var iCardRanking = 0;
					var iCardPoints = 0;
					if (sCardSymbol.toUpperCase() === sAtout.toUpperCase()) {
						iCardRanking = oScoreModel.getProperty("/Atout/" + sCardValue + "/Ranking");
						iCardPoints = oScoreModel.getProperty("/Atout/" + sCardValue + "/Points")
					} else if (sCardSymbol === sRequestedColor) {
						iCardRanking = oScoreModel.getProperty("/NonAtout/" + sCardValue + "/Ranking");
						iCardPoints = oScoreModel.getProperty("/NonAtout/" + sCardValue + "/Points");
					} else {
						iCardPoints = oScoreModel.getProperty("/NonDemande/" + sCardValue + "/Points");
					}
					aCardsPlayed.push({
						cardName: sCardName,
						playerIndex: i,
						ranking: iCardRanking,
						points: iCardPoints
					});
				}
			}

			//sort by descending ranking
			aCardsPlayed.sort(this.util._sortByRanking);
			oMasterPlayer.index = aCardsPlayed[0].playerIndex;
			oMasterPlayer.Name = this.util._getPlayerNameByID(oMasterPlayer.index, NPlayers);
			// update model
			firebase.database().ref(this._tablePath).update({
				MasterPlayer: oMasterPlayer
			});

			// end of fold
			if (aCardsPlayed.length === 4) {
				this.handleEndOfFold(oMasterPlayer, aCardsPlayed, oModel, iRemaningCardsBeforeThisTurn)
			}
		},

		handleEndOfFold: function (oMasterPlayer, aCardsPlayed, oModel, iRemaningCardsBeforeThisTurn) {
			// update current player
			var sCurrentPlayer = oMasterPlayer.Name;
			firebase.database().ref(this._tablePath).update({
				CurrentPlayer: sCurrentPlayer
			});
			firebase.database().ref(this._tablePath).update({
				Requestor: sCurrentPlayer
			});

			//save fold
			firebase.database().ref(this._tablePath).update({
				LastFold: aCardsPlayed
			});

			//update temporary score
			var iScore = 0;
			var iTeam1TempScore = oModel.getProperty("/PlayTable/NTeams/0/TempScore") || 0;
			var iTeam2TempScore = oModel.getProperty("/PlayTable/NTeams/1/TempScore") || 0;
			for (var i = 0; i < aCardsPlayed.length; i++) {
				iScore += aCardsPlayed[i].points;
			}
			var iWinningTeam = oMasterPlayer.index === 0 || oMasterPlayer.index === 2 ? 0 : 1;
			var iNewScore = iWinningTeam === 0 ? iTeam1TempScore + iScore : iTeam2TempScore + iScore;
			firebase.database().ref(this._tablePath + "/NTeams/" + iWinningTeam).update({
				TempScore: iNewScore
			});
			oModel.setProperty("/PlayTable/NTeams/" + iWinningTeam + "/TempScore", iNewScore);

			//update global scrore in case of last fold

			if (iRemaningCardsBeforeThisTurn === 1) {
				var iTeam1Score = oModel.getProperty("/PlayTable/NTeams/0/Score") || 0;
				var iTeam2Score = oModel.getProperty("/PlayTable/NTeams/1/Score") || 0;
				iTeam1TempScore = oModel.getProperty("/PlayTable/NTeams/0/TempScore") || 0;
				iTeam2TempScore = oModel.getProperty("/PlayTable/NTeams/1/TempScore") || 0;
				var iTeam1NewScore = iTeam1Score + iTeam1TempScore;
				var iTeam2NewScore = iTeam2Score + iTeam2TempScore;
				firebase.database().ref(this._tablePath + "/NTeams/0").update({
					Score: iTeam1NewScore
				});
				firebase.database().ref(this._tablePath + "/NTeams/1").update({
					Score: iTeam2NewScore
				});

			}

		},

		handleScorePopoverPress: function (oEvent) {
			var oLocalModel = this.getView().getModel("localModel");
			var oButton = oEvent.getSource();
			// create popover
			if (!this._oPopover) {
				Fragment.load({
					name: "com.belote.fragment.scorePopOver",
					controller: this
				}).then(function (pPopover) {
					this._oPopover = pPopover;
					this.getView().addDependent(this._oPopover);
					this._oPopover.setModel(oLocalModel);
					this._oPopover.bindElement("/PlayTable");
					this._oPopover.openBy(oButton);
				}.bind(this));
			} else {
				this._oPopover.openBy(oButton);
			}
		},

		handleCloseScorePress: function () {
			this._oPopover.close();
		},
		// Update team temporary score after each set of 4 cards
		_updateScore: function (aCards) {
			var iScore = 0;
			var iBestIndex = 0;
			var iCurrentIndex, oBestCard;
			var oScoreModel = this.getView().getModel("scoreModel");
			var oLocalModel = this.getView().getModel("localModel");

			// Calculate score and best card
			for (var i = 0; i < aCards.length; i++) {
				if (aCards[i].Name.split("/")[0] === oLocalModel.getProperty("/Atout")) {
					iCurrentIndex = oScoreModel.getProperty("/Atout/" + aCards[i].Name.split("/")[1] + "/Ranking");
					iScore = iScore + oScoreModel.getProperty("/Atout/" + aCards[i].Name.split("/")[1] + "/Points");

					if (iCurrentIndex > iBestIndex) {
						iBestIndex = iCurrentIndex;
						oBestCard = aCards[i];
					}
				} else if (aCards[i].Name.split("/")[0] === oLocalModel.getProperty("/CouleurDemandee")) {
					iCurrentIndex = oScoreModel.getProperty("/NonAtout/" + aCards[i].Name.split("/")[1] + "/Ranking");
					iScore = iScore + oScoreModel.getProperty("/NonAtout/" + aCards[i].Name.split("/")[1] + "/Points");

					if (iCurrentIndex > iBestIndex) {
						iBestIndex = iCurrentIndex;
						oBestCard = aCards[i];
					}
				} else {
					iCurrentIndex = oScoreModel.getProperty("/NonDemande/" + aCards[i].Name.split("/")[1] + "/Ranking");
					iScore = iScore + oScoreModel.getProperty("/NonDemande/" + aCards[i].Name.split("/")[1] + "/Points");

					if (iCurrentIndex > iBestIndex) {
						iBestIndex = iCurrentIndex;
						oBestCard = aCards[i];
					}
				}
			}

			// Update local model
			if (oBestCard.Player === "1" || oBestCard.Player === "3") {
				oLocalModel.setProperty("/TempScoreTeam1", oLocalModel.getProperty("/TempScoreTeam1") + iScore);
			} else {
				oLocalModel.setProperty("/TempScoreTeam2", oLocalModel.getProperty("/TempScoreTeam2") + iScore);
			}

			// If no card remaining, update the model with real score
			if (oLocalModel.getProperty("/RemainingCard") < 1) {
				var bIsCapot = false;
				var bIsFailed = false;
				oLocalModel.setProperty("/RemainingCard", 8);

				if (oLocalModel.getProperty("/TempScoreTeam1") === 0) {
					bIsCapot = true;
					oLocalModel.setProperty("/ScoreTeam2", oLocalModel.getProperty("/ScoreTeam2") + 250);
				}

				if (oLocalModel.getProperty("/TempScoreTeam2") === 0) {
					bIsCapot = true;
					oLocalModel.setProperty("/ScoreTeam1", oLocalModel.getProperty("/ScoreTeam1") + 250);
				}

				if (!bIsCapot) {

				}
			}
		}
	});
});