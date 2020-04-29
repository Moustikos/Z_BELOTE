/*****************************************************************************************************************
 * File description         : The formatter contains all functions used to dynamically calculate values
 * Modification description : MOUSTIKOS - 19.04.2020 - Creation                                    
 *****************************************************************************************************************/
sap.ui.define([], function () {
	"use strict";
	return {
		getNonEmpty: function (sValue) {
			return sValue !== "" && sValue !== undefined && sValue !== null;
		},

		getCardValue: function (sCardName) {
			var sReturn = "";
			if (sCardName) {
				sReturn = sCardName.split("-")[1];
			}

			return sReturn;
		},

		getSuggestCardEnabled: function (sPlayerName) {
			var bReturn = false;
			if (firebase.auth().currentUser) {
				bReturn = sPlayerName === firebase.auth().currentUser.displayName;
			}

			return bReturn;
		},

		getSuggestCardTakeVisible: function (iTour) {
			return iTour === 1;
		},

		getCustomColorTakeVisible: function (iTour) {
			return iTour === 2;
		},

		getPlayerVisible: function (Player) {
			return Player ? true : false;
		},

		getAtoutIcon: function (sAtout) {
			switch (sAtout) {
			case "trefle":
				return "sap-icon://customfont/trefle";
				break;
			case "coeur":
				return "sap-icon://customfont/coeur";
				break;
			case "pique":
				return "sap-icon://customfont/pique";
				break;
			case "carreau":
				return "sap-icon://customfont/carreau";
				break;
			default:
				return ""
				break;
			}
		},

		getAtoutIconColor: function (sAtout) {
			return sAtout === "coeur" || sAtout === "carreau" ? "red" : "black";
		},

		getScore: function (iScore) {
			return iScore !== undefined ? iScore : 0;
		},

		getAtoutVisible: function (sAtout) {
			return sAtout === "" ? false : true;
		},

		getTableListItemVisible: function (oModel) {
			return oModel === undefined ? false : true;
		},

		getJoinButtonTeam1Enabled: function (NPlayers) {
			if (NPlayers) {
				var aTeam1Players = [];
				for (let i = 0; i < NPlayers.length; i++) {
					if (NPlayers[i] && (NPlayers[i].ID === 0 || NPlayers[i].ID === 2)) {
						aTeam1Players.push(NPlayers[i]);
					}
				}
				return aTeam1Players.length >= 2 ? false : true;
			} else {
				return true;
			}
		},

		getJoinButtonTeam2Enabled: function (NPlayers) {
			if (NPlayers) {
				var aTeam1Players = [];
				for (let i = 0; i < NPlayers.length; i++) {
					if (NPlayers[i] && (NPlayers[i].ID === 1 || NPlayers[i].ID === 3)) {
						aTeam1Players.push(NPlayers[i]);
					}
				}
				return aTeam1Players.length >= 2 ? false : true;
			} else {
				return true;
			}
		},

		getLeaveButtonVisible: function (Player) {
			const sPlayerName = firebase.auth().currentUser.displayName;
			return Player && Player.Name === sPlayerName ? true : false;
		},

		getNumberOfPlayers: function (NPlayers) {
			var iCounter = 0;
			if (NPlayers) {
				for (let i = 0; i < NPlayers.length; i++) {
					if (NPlayers[i]) {
						iCounter++
					}
				}
			}
			return iCounter;
		}
	};
});