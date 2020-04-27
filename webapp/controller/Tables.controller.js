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
				aTables = (snapshot.val());
				oModel.setProperty("/ETTables", aTables);
				that.checkIfTableIsFull(oModel);
			});
		},

		checkIfTableIsFull: function (oModel) {
			const aTables = oModel.getProperty("/ETTables");
			var iCounter;
			var bCurrentPlayerisInTable = false;
			const sPlayerName = firebase.auth().currentUser.displayName;
			for (let i = 0; i < aTables.length; i++) {
				if (aTables[i].NPlayers) {
					iCounter = 0;
					bCurrentPlayerisInTable = false;
					for (let j = 0; j < aTables[i].NPlayers.length; j++) {
						if (aTables[i].NPlayers[j] && aTables[i].NPlayers[j].Name) {
							iCounter++;
							if (aTables[i].NPlayers[j].Name === sPlayerName) {
								bCurrentPlayerisInTable = true;
							}
						}
						if (iCounter === 4 && bCurrentPlayerisInTable === true) {
							firebase.database().ref("ETTableSet/" + i).update({
								isFull: true
							});
							this._getRouter().navTo("Play", {
								teamPath: "ETTableSet-" + i
							});
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
			if (!sNewTableName) {
				sap.m.MessageToast.show("Please enter at least a table name");
				return;
			}
			this.addNewTable(sNewTableName, sNewTableDesc);
			this._oCreateTablePopup.close();
		},

		onPressCancelNewTable: function () {
			this._oCreateTablePopup.close();
		},

		addNewTable: function (sNewTableName, sNewTableDesc) {
			var aTables = this.getView().getModel("localModel").getProperty("/ETTables");
			const iNewTableKey = aTables.indexOf(aTables[aTables.length - 1]) + 1;
			firebase.database().ref("ETTableSet/" + iNewTableKey).set({
				Name: sNewTableName,
				ID: iNewTableKey,
				Description: sNewTableDesc
			});
		},

		onPressTableListItem: function (oEvent) {
			var oModel = this.getView().getModel("localModel");
			var iTableId = oEvent.getSource().getBindingContextPath().split('/')[oEvent.getSource().getBindingContextPath().split('/').length -
				1];
			var sBindingPath = oEvent.getSource().getBindingContextPath();
			if (!this._oWaitingRoomPopup) {
				this._oWaitingRoomPopup = sap.ui.xmlfragment(this.getView().getId(), "com.belote.fragment.waitingRoom", this);
				this.getView().addDependent(this._oWaitingRoomPopup);
				this._oWaitingRoomPopup.setModel(oModel);
				this._oWaitingRoomPopup.bindElement(sBindingPath);
			}
			this._oWaitingRoomPopup.open();
		},

		onPressCloseTable: function () {
			this._oWaitingRoomPopup.close();
			this._oWaitingRoomPopup.destroy();
			this._oWaitingRoomPopup = undefined;
		},

		getPlayersAssignedToATable: function () {
			const aTables = this.getView().getModel("localModel").getProperty("/ETTables");
			var aPlayersAssignedToATable = [];
			for (let i = 0; i < aTables.length; i++) {
				if (aTables[i].NPlayers) {
					for (let j = 0; j < aTables[i].NPlayers.length; j++) {
						if (aTables[i].NPlayers[j] && aTables[i].NPlayers[j].Name) {
							aPlayersAssignedToATable.push(aTables[i].NPlayers[j].Name);
						}
					}
				}
			}
			return aPlayersAssignedToATable;
		},

		onJoinTeam1: function () {
			const sTablePath = this._oWaitingRoomPopup.getBindingContext().sPath
			const oTable = this.getView().getModel("localModel").getProperty(sTablePath);
			const aAssignedPlayers = this.getPlayersAssignedToATable();
			var aTeamPlayers = [];
			const sPlayerName = firebase.auth().currentUser.displayName;
			var iPlayerID;
			for (let j = 0; j < aAssignedPlayers.length; j++) {
				if (aAssignedPlayers[j] === sPlayerName) {
					sap.m.MessageToast.show("You are already assigned to a table !");
					return;
				}
			}
			if (oTable.NPlayers) {
				for (let i = 0; i < oTable.NPlayers.length; i++) {
					if (oTable.NPlayers[i]) {
						if (oTable.NPlayers[i].ID === 0 || oTable.NPlayers[i].ID === 2) {
							aTeamPlayers.push(oTable.NPlayers[i]);
						}
					}
				}
				switch (aTeamPlayers.length) {
				case 0:
					iPlayerID = 0;
					break;
				case 1:
					iPlayerID = aTeamPlayers[0].ID === 0 ? 2 : 0;
					break;
				}
			} else {
				iPlayerID = 0;
			}
			firebase.database().ref("ETTableSet/" + oTable.ID + "/NPlayers/" + iPlayerID).set({
				Name: sPlayerName,
				ID: iPlayerID
			});
		},

		onJoinTeam2: function () {
			const sTablePath = this._oWaitingRoomPopup.getBindingContext().sPath
			const oTable = this.getView().getModel("localModel").getProperty(sTablePath);
			var aTeamPlayers = [];
			const aAssignedPlayers = this.getPlayersAssignedToATable();
			const sPlayerName = firebase.auth().currentUser.displayName;
			var iPlayerID;
			for (let j = 0; j < aAssignedPlayers.length; j++) {
				if (aAssignedPlayers[j] === sPlayerName) {
					sap.m.MessageToast.show("You are already assigned to a table !");
					return;
				}
			}
			if (oTable.NPlayers) {
				for (let i = 0; i < oTable.NPlayers.length; i++) {
					if (oTable.NPlayers[i]) {
						if (oTable.NPlayers[i].ID === 1 || oTable.NPlayers[i].ID === 3) {
							aTeamPlayers.push(oTable.NPlayers[i]);
						}
					}
				}
				switch (aTeamPlayers.length) {
				case 0:
					iPlayerID = 1;
					break;
				case 1:
					iPlayerID = aTeamPlayers[0].ID === 1 ? 3 : 1;
					break;
				}
			} else {
				iPlayerID = 1;
			}
			firebase.database().ref("ETTableSet/" + oTable.ID + "/NPlayers/" + iPlayerID).set({
				Name: sPlayerName,
				ID: iPlayerID
			});
		},

		onLeaveTeam: function () {
			const aTables = this.getView().getModel("localModel").getProperty("/ETTables");
			const sPlayerName = firebase.auth().currentUser.displayName;
			var aPlayersAssignedToATable = [];
			for (let i = 0; i < aTables.length; i++) {
				if (aTables[i].NPlayers) {
					for (let j = 0; j < aTables[i].NPlayers.length; j++) {
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