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

		_onMessageEntityReceived: function (snapshot) {
			var oMessage = snapshot.val();
			if (oMessage) {
				var sSender = oMessage.sender;
				var sText = oMessage.text;
				var bDisplayIt = oMessage.displayIt;
				if (bDisplayIt) {
					sap.m.MessageToast.show(sSender + " say : " + sText);
				}
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
							updates["/DoneFinished"] = false;
						}
						firebase.database().ref(this._tablePath).update(updates);
						break;
					}
				}
			} else {
				updates["/SuggestedCard"] = "";
				updates["/Atout"] = sChoice.toLowerCase();
				updates["/Preneur"] = firebase.auth().currentUser.displayName;
				updates["/DoneFinished"] = true;
				this._distributeRemainingCards(updates);
				firebase.database().ref(this._tablePath).update(updates);
			}
		},

		onSelectCard: function (oEvent) {
			var oModel = this.getView().getModel("localModel");

			if (oModel.getProperty("/PlayTable/CurrentPlayer") === firebase.auth().currentUser.displayName) {
				var iRemaningCardsBeforeThisTurn = oModel.getProperty('/PlayTable/NOrdererPlayers/0/NCards').length
				var oMasterPlayer = oModel.getProperty("/PlayTable/MasterPlayer");
				var sPlayerName = firebase.auth().currentUser.displayName;
				var iPlayerIndex = oModel.getProperty("/PlayTable/NOrdererPlayers/0/ID");
				var sCardName = oModel.getProperty(oEvent.getSource().getBindingContext("localModel").getPath()).Name;
				var sAtout = oModel.getProperty("/PlayTable/Atout");
				var updates = {};

				//clear table in case of new turn
				if (sPlayerName === oMasterPlayer.Name) {
					this.clearTable();
				}

				//trigger belote announcement
				var bIsBelotePossible = this.isBelotePossible(iPlayerIndex);
				var bIsBeloteAnnouced = oModel.getProperty("/PlayTable/NPlayers/" + iPlayerIndex + "/BeloteAnnouced");
				if ((this.util._getCardSymbol(sCardName).toUpperCase() === sAtout.toUpperCase()) && (this.util._getCardValue(sCardName) === "R" ||
						this.util._getCardValue(sCardName) === "D")) {
					if (bIsBelotePossible && bIsBeloteAnnouced === undefined) {
						// tigger popup to choose to announce belote
						if (!this._oAnnounceBelotePopup) {
							this._oAnnounceBelotePopup = sap.ui.xmlfragment(this.getView().getId(), "com.belote.fragment.announceBelote", this);
							this.getView().addDependent(this._oAnnounceBelotePopup);
						}
						this._oAnnounceBelotePopup.open();
					} else if (bIsBeloteAnnouced) {
						// trigger snackbar to announce rebelote
						this.util._sendMessageToPlayers(this.getView().getModel("i18n").getProperty("Rebelote"), this._tablePath);
					}
				}

				//update cards
				updates["/Player" + iPlayerIndex + "Card"] = sCardName;
				updates["/CurrentPlayer"] = oModel.getProperty(
					"/PlayTable/NOrdererPlayers/1/Name");
				firebase.database().ref(this._tablePath + "/NPlayers/" + iPlayerIndex + "/NCards/" +
					oModel.getProperty(oEvent.getSource().getBindingContext(
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
			var iWinningTeam = oMasterPlayer.index === 0 || oMasterPlayer.index === 2 ? 0 : 1;
			firebase.database().ref(this._tablePath).update({
				CurrentPlayer: sCurrentPlayer
			});
			firebase.database().ref(this._tablePath).update({
				Requestor: sCurrentPlayer
			});

			//save Last fold
			firebase.database().ref(this._tablePath).update({
				NLastFold: aCardsPlayed
			});

			//Save fold
			var NFoldsWinningTeam = [];
			var aPreviousFolds = oModel.getProperty("/PlayTable/NTeams/" + iWinningTeam + "/Folds");
			if (aPreviousFolds !== undefined) {
				for (var i = 0; i < aPreviousFolds.length; i++) {
					NFoldsWinningTeam.push(aPreviousFolds[i]);
				}
			}
			for (var j = 0; j < aCardsPlayed.length; j++) {
				NFoldsWinningTeam.push(aCardsPlayed[j]);
			}
			firebase.database().ref(this._tablePath + "/NTeams/" + iWinningTeam).update({
				NFolds: NFoldsWinningTeam
			});
			oModel.setProperty("/PlayTable/NTeams/" + iWinningTeam + "/Folds", NFoldsWinningTeam);

			//update temporary score
			var iScore = 0;
			var iTeam1TempScore = oModel.getProperty("/PlayTable/NTeams/0/TempScore") || 0;
			var iTeam2TempScore = oModel.getProperty("/PlayTable/NTeams/1/TempScore") || 0;
			for (var i = 0; i < aCardsPlayed.length; i++) {
				iScore += aCardsPlayed[i].points;
			}
			var iNewScore = iWinningTeam === 0 ? iTeam1TempScore + iScore : iTeam2TempScore + iScore;
			firebase.database().ref(this._tablePath + "/NTeams/" + iWinningTeam).update({
				TempScore: iNewScore
			});
			oModel.setProperty("/PlayTable/NTeams/" + iWinningTeam + "/TempScore", iNewScore);

			//Check if the card selected is the last one
			if (iRemaningCardsBeforeThisTurn === 1) {
				this.handleEndOfDone(oModel, oMasterPlayer);
			}
		},

		// Triggered when the last card is selected
		handleEndOfDone: function (oModel, oMasterPlayer) {
			var NPlayers = oModel.getProperty("/PlayTable/NPlayers");
			var sPreneur = oModel.getProperty("/PlayTable/Preneur");
			var iTeam1TempScore = oModel.getProperty("/PlayTable/NTeams/0/TempScore") || 0;
			var iTeam2TempScore = oModel.getProperty("/PlayTable/NTeams/1/TempScore") || 0;
			var iPreneurTeamID = this.util._getTeamIdByPlayerId(this.util._getPlayerIdByName(sPreneur, NPlayers));
			var iTeam1AdditionalPoints = 0;
			var iTeam2AdditionalPoints = 0;

			// dix de dèr
			iTeam1AdditionalPoints += oMasterPlayer.index === 0 || oMasterPlayer.index === 2 ? 10 : 0;
			iTeam2AdditionalPoints += oMasterPlayer.index === 1 || oMasterPlayer.index === 3 ? 10 : 0;

			//belote et rebelotes 
			var isBeloteAnnoucedByTeam1 = oModel.getProperty("/PlayTable/NPlayers/0/BeloteAnnouced") || oModel.getProperty(
				"/PlayTable/NPlayers/2/BeloteAnnouced") ? true : false;
			var isBeloteAnnoucedByTeam2 = oModel.getProperty("/PlayTable/NPlayers/1/BeloteAnnouced") || oModel.getProperty(
				"/PlayTable/NPlayers/3/BeloteAnnouced") ? true : false;

			// Contrat 
			var iContrat = isBeloteAnnoucedByTeam1 || isBeloteAnnoucedByTeam2 ? 91 : 81;

			//TempScore
			iTeam1TempScore += iTeam1AdditionalPoints;
			iTeam2TempScore += iTeam2AdditionalPoints;

			// Dedans
			var bTeam1Dedans = false;
			var bTeam2Dedans = false;
			if (iPreneurTeamID === 0) {
				bTeam1Dedans = iTeam1TempScore < iContrat ? true : false;
			} else {
				bTeam2Dedans = iTeam2TempScore < iContrat ? true : false;
			}
			if (bTeam1Dedans) {
				iTeam1TempScore = 0;
				iTeam2TempScore = 162;
			} else if (bTeam2Dedans) {
				iTeam1TempScore = 162;
				iTeam2TempScore = 0;
			}

			//Capot
			var NFoldsTeam1 = oModel.getProperty("/PlayTable/NTeams/0/NFolds");
			var NFoldsTeam2 = oModel.getProperty("/PlayTable/NTeams/1/NFolds");
			var bIsTeam1Capot = NFoldsTeam1 === undefined ? true : false;
			var bIsTeam2Capot = NFoldsTeam2 === undefined ? true : false;

			if (bIsTeam1Capot) {
				iTeam1TempScore = 0;
				iTeam2TempScore = 250;
			} else if (bIsTeam2Capot) {
				iTeam1TempScore = 250;
				iTeam2TempScore = 0;
			}

			//add belote points
			iTeam1TempScore += isBeloteAnnoucedByTeam1 ? 20 : 0;
			iTeam2TempScore += isBeloteAnnoucedByTeam2 ? 20 : 0;
			var iTeam1Score = oModel.getProperty("/PlayTable/NTeams/0/Score") || 0;
			var iTeam2Score = oModel.getProperty("/PlayTable/NTeams/1/Score") || 0;
			var iTeam1NewScore = iTeam1Score + iTeam1TempScore;
			var iTeam2NewScore = iTeam2Score + iTeam2TempScore;

			firebase.database().ref(this._tablePath + "/NTeams/0").update({
				Score: iTeam1NewScore,
				TempScore: 0
			});
			firebase.database().ref(this._tablePath + "/NTeams/1").update({
				Score: iTeam2NewScore,
				TempScore: 0
			});

			//Check score limit
			var iScoreLimit = oModel.getProperty("/PlayTable/ScoreLimit")
			var bGameOver = (iTeam1NewScore >= iScoreLimit || iTeam2NewScore >= iScoreLimit) && iTeam1NewScore !== iTeam2NewScore ? true :
				false;

			if (bGameOver) {
				// handle end of game
				var iWinnerTeam = iTeam1NewScore > iTeam2NewScore ? 0 : 1;
				var sMessage = (this.getView().getModel("i18n").getProperty("Winner") + " " + (iWinnerTeam + 1));
				this.util._sendMessageToPlayers(sMessage, this._tablePath);

			} else {
				// Define next distributor
				var sDistributor = oModel.getProperty("/PlayTable/Distributor");
				var iDistributorID = this.util._getPlayerIdByName(sDistributor, NPlayers);
				var iNewDistributorID = (iDistributorID + 1) % 4;
				var sNewDistributorName = this.util._getPlayerNameByID(iNewDistributorID, NPlayers);
				var iNewCurrentPlayerID = (iNewDistributorID + 1) % 4;
				var sNewCurrentPlayerID = this.util._getPlayerNameByID(iNewCurrentPlayerID, NPlayers);

				//clear current fold and perform a new done
				var that = this;
				setTimeout(function () {
					that.clearTable();
					that.clearDoneData();
					firebase.database().ref(that._tablePath).update({
						Distributor: sNewDistributorName,
						CurrentPlayer: sNewCurrentPlayerID,
						IsShuffleNeeded: true,
						DoneFinished: false,
						DistributionTour: 1,
						Atout: ""
					});
				}, 3000);
			}
		},

		clearTable: function () {
			for (var i = 0; i < 4; i++) {
				//remove played cards
				firebase.database().ref(this._tablePath + "/Player" + i + "Card").remove();

			}
		},

		clearDoneData: function () {
			// remove belote
			for (var i = 0; i < 4; i++) {
				firebase.database().ref(this._tablePath + "/NPlayers/" + i + "/BelotePossible").remove();
				firebase.database().ref(this._tablePath + "/NPlayers/" + i + "/BeloteAnnounced").remove();
			}
			firebase.database().ref(this._tablePath + "/NLastFold").remove();

		},

		isBelotePossible: function (iPlayerIndex) {
			var oModel = this.getView().getModel("localModel");
			var sAtout = oModel.getProperty("/PlayTable/Atout");
			var aPlayerCards = oModel.getProperty("/PlayTable/NPlayers/" + iPlayerIndex + "/NCards");
			var bIsRoy = false;
			var bIsQueen = false
			var bIsBelotePossible = oModel.getProperty("/PlayTable/NPlayers/" + iPlayerIndex + "/BelotePossible");
			if (bIsBelotePossible === undefined) {
				aPlayerCards.forEach(
					function (oCard) {
						var sColor = this.util._getCardSymbol(oCard.Name);
						var sValue = this.util._getCardValue(oCard.Name);
						if (sColor.toUpperCase() === sAtout.toUpperCase()) {
							if (sValue === "R") {
								bIsRoy = true;
							} else if (sValue === "D") {
								bIsQueen = true;
							}
						}
					}, this);
				bIsBelotePossible = bIsRoy && bIsQueen ? true : false;
				firebase.database().ref(this._tablePath + "/NPlayers/" + iPlayerIndex).update({
					BelotePossible: bIsBelotePossible
				});
			}
			return bIsBelotePossible;
		},

		onPressYesAnnounceBelote: function () {
			var oModel = this.getView().getModel("localModel");
			var iPlayerIndex = oModel.getProperty("/PlayTable/NOrdererPlayers/0/ID");
			firebase.database().ref(this._tablePath + "/NPlayers/" + iPlayerIndex).update({
				BeloteAnnouced: true
			});
			oModel.setProperty("/PlayTable/NPlayers/" + iPlayerIndex + "/BeloteAnnouced", true);
			this.util._sendMessageToPlayers(this.getView().getModel("i18n").getProperty("Belote"), this._tablePath);
			this._oAnnounceBelotePopup.close();
			this._oAnnounceBelotePopup.destroy();
			this._oAnnounceBelotePopup = undefined;
		},

		onPressNoAnnounceBelote: function () {
			var oModel = this.getView().getModel("localModel");
			var iPlayerIndex = oModel.getProperty("/PlayTable/NOrdererPlayers/0/ID");
			firebase.database().ref(this._tablePath + "/NPlayers/" + iPlayerIndex).update({
				BeloteAnnouced: false
			});
			oModel.setProperty("/PlayTable/NPlayers/" + iPlayerIndex + "/BeloteAnnouced", false);
			this._oAnnounceBelotePopup.close();
			this._oAnnounceBelotePopup.destroy();
			this._oAnnounceBelotePopup = undefined;
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