sap.ui.define(["com/belote/controller/BaseController"], function (BaseController) {
	"use strict";

	return BaseController.extend("com.belote.controller.Tables", {

		onInit: function () {
			this._initializeFirebaseWatch(this);
			this._getRouter().getRoute("Tables").attachPatternMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function () {
			var oModel = this.getView().getModel("localModel");
			this.getTablesList(oModel);
		},

		getTablesList: function (oModel) {
			var that = this;
			var aTables;
			firebase.database().ref("ETTableSet").on("value", function (snapshot) {
				aTables = snapshot.val();
				oModel.setProperty("/ETTables", aTables);
				that.checkIfTableIsFull(oModel);
			});
		},

		checkIfTableIsFull: function (oModel) {
			var aTables = oModel.getProperty("/ETTables");
			var iCounter;
			var bCurrentPlayerisInTable = false;
			var sPlayerName = firebase.auth().currentUser.displayName;
			for (var i = 0; i < aTables.length; i++) {
				if (aTables[i]) {
					if (aTables[i].NPlayers) {
						iCounter = 0;
						bCurrentPlayerisInTable = false;
						for (var j = 0; j < aTables[i].NPlayers.length; j++) {
							if (aTables[i].NPlayers[j] && aTables[i].NPlayers[j].Name) {
								iCounter++;
								if (aTables[i].NPlayers[j].Name === sPlayerName) {
									bCurrentPlayerisInTable = true;
								}
							}
							if (iCounter === 4 && bCurrentPlayerisInTable === true) {
								firebase.database().ref("ETTableSet").off();
								firebase.database().ref("ETTableSet/" + i).update({
									isFull: true,
									CurrentPlayer: aTables[i].NPlayers[1].Name,
									Distributor: aTables[i].NPlayers[0].Name,
									Requestor: aTables[i].NPlayers[1].Name
								});
								firebase.database().ref("ETTableSet/" + i + "/MasterPlayer").update({
									Name: aTables[i].NPlayers[1].Name,
									ID: aTables[i].NPlayers[1].ID
								});
								
								this._getRouter().navTo("Play", {
									teamPath: "ETTableSet-" + i
								});
							}
						}
					}
				}
			}
		},

		onPressAddTableButton: function () {
			if (!this._oCreateTablePopup) {
				this._oCreateTablePopup = sap.ui.xmlfragment(this.getView().getId(), "com.belote.fragment.createTable", this);
				this.getView().addDependent(this._oCreateTablePopup);
			}
			this._oCreateTablePopup.open();
		},

		onPressCreateNewTable: function () {
			var sNewTableName = this.byId("idNewTableName").getValue();
			var sNewTableDesc = this.byId("idNewTableNameDesc").getValue();
			var iScoreLimit = this.byId("idNewTableScoreLimit").getValue();
			if (!sNewTableName) {
				sap.m.MessageToast.show("Please enter at least a table name");
				return;
			}
			this.addNewTable(sNewTableName, sNewTableDesc, iScoreLimit);
			this._oCreateTablePopup.close();
		},

		onPressCancelNewTable: function () {
			this._oCreateTablePopup.close();
		},

		addNewTable: function (sNewTableName, sNewTableDesc, iScoreLimit) {
			var aTables = this.getView().getModel("localModel").getProperty("/ETTables");
			var iNewTableKey = aTables.indexOf(aTables[aTables.length - 1]) + 1;
			firebase.database().ref("ETTableSet/" + iNewTableKey).set({
				Name: sNewTableName,
				ID: iNewTableKey,
				ScoreLimit : iScoreLimit,
				Description: sNewTableDesc,
				Atout: "",
				CurrentPlayer: "",
				DistributionTour: 1,
				Distributor: "",
				IsShuffleNeeded: true,
				Preneur: "",
				SuggestedCard: ""
			});
		},

		onPressTableListItem: function (oEvent) {
			var oModel = this.getView().getModel("localModel");
			var iTableId = oEvent.getSource().getBindingContextPath().split('/')[oEvent.getSource().getBindingContextPath().split('/').length -
				1];
			var sBindingPath = oEvent.getSource().getBindingContextPath();
			if (!this._oJoinTeamPopup) {
				this._oJoinTeamPopup = sap.ui.xmlfragment(this.getView().getId(), "com.belote.fragment.joinTeam", this);
				this.getView().addDependent(this._oJoinTeamPopup);
				this._oJoinTeamPopup.setModel(oModel);
				this._oJoinTeamPopup.bindElement(sBindingPath);
			}
			this._oJoinTeamPopup.open();
		},

		onPressCloseTable: function () {
			this._oJoinTeamPopup.close();
			this._oJoinTeamPopup.destroy();
			this._oJoinTeamPopup = undefined;
		},

		getPlayersAssignedToATable: function () {
			var aTables = this.getView().getModel("localModel").getProperty("/ETTables");
			var aPlayersAssignedToATable = [];
			for (var i = 0; i < aTables.length; i++) {
				if (aTables[i])
					if (aTables[i].NPlayers) {
						for (var j = 0; j < aTables[i].NPlayers.length; j++) {
							if (aTables[i].NPlayers[j] && aTables[i].NPlayers[j].Name) {
								aPlayersAssignedToATable.push({
									playerName: aTables[i].NPlayers[j].Name,
									tableName: aTables[i].Name
								});
							}
						}
					}
			}
			return aPlayersAssignedToATable;
		},

		onJoinTeam: function (oEvent) {
			var iTeamNumber = oEvent.getSource().getId().indexOf("idJoinTeam1Button") < 0 ? 2 : 1;
			var iFirstPlayerID;
			var iSecondPlayerID;
			switch (iTeamNumber) {
			case 1:
				iFirstPlayerID = 0;
				iSecondPlayerID = 2;
				break;
			case 2:
				iFirstPlayerID = 1;
				iSecondPlayerID = 3
				break;
			}
			var sTablePath = this._oJoinTeamPopup.getBindingContext().sPath
			var oTable = this.getView().getModel("localModel").getProperty(sTablePath);
			var aAssignedPlayers = this.getPlayersAssignedToATable();
			var aTeamPlayers = [];
			var sPlayerName = firebase.auth().currentUser.displayName;
			var iPlayerID;
			for (var j = 0; j < aAssignedPlayers.length; j++) {
				if (aAssignedPlayers[j].playerName === sPlayerName) {
					sap.m.MessageToast.show("You are already assigned to table " + aAssignedPlayers[j].tableName);
					return;
				}
			}
			if (oTable.NPlayers) {
				for (var i = 0; i < oTable.NPlayers.length; i++) {
					if (oTable.NPlayers[i]) {
						if (oTable.NPlayers[i].ID === iFirstPlayerID || oTable.NPlayers[i].ID === iSecondPlayerID) {
							aTeamPlayers.push(oTable.NPlayers[i]);
						}
					}
				}
				switch (aTeamPlayers.length) {
				case 0:
					iPlayerID = iFirstPlayerID;
					break;
				case 1:
					iPlayerID = aTeamPlayers[0].ID === iFirstPlayerID ? iSecondPlayerID : iFirstPlayerID;
					break;
				}
			} else {
				iPlayerID = iFirstPlayerID;
			}
			firebase.database().ref("ETTableSet/" + oTable.ID + "/NPlayers/" + iPlayerID).set({
				Name: sPlayerName,
				ID: iPlayerID
			});
		},

		onLeaveTeam: function () {
			var aTables = this.getView().getModel("localModel").getProperty("/ETTables");
			var sPlayerName = firebase.auth().currentUser.displayName;
			var aPlayersAssignedToATable = [];
			for (var i = 0; i < aTables.length; i++) {
				if (aTables[i])
					if (aTables[i].NPlayers) {
						for (var j = 0; j < aTables[i].NPlayers.length; j++) {
							if (aTables[i].NPlayers[j] && aTables[i].NPlayers[j].Name) {
								if (aTables[i].NPlayers[j].Name === sPlayerName) {
									firebase.database().ref('/ETTableSet/' + i + "/NPlayers/" + j).remove();
								}
							}
						}
					}
			}
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.belote.view.Tables
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.belote.view.Tables
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.belote.view.Tables
		 */
		//	onExit: function() {
		//
		//	}

	});

});