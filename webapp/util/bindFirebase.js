/*****************************************************************************************************************
* File description         : The bindFirebase file is used to update local model when data are updated in firebase
* Modification description : MOUSTIKOS - 19.04.2020 - Creation                                    
*****************************************************************************************************************/

sap.ui.define([], function() {
    "use strict";
    return {
        _initialize : function(that) {
            firebase.auth().onAuthStateChanged(this.onUserAuthenticationModified.bind(that));
        },

        // Called when user session changes
        onUserAuthenticationModified: function (user) {
            // Update the local model properties
            this.getView().getModel("localModel").setProperty("/isUserRegistered", user !== null ? true : false);

            // If user is recognized, ask for display name is not already mentioned or display welcome message
            if (user) {
                if (user && (firebase.auth().currentUser.displayName === "" || !firebase.auth().currentUser.displayName)) {
                    if (!this._oUserPopup) {
                        this._oUserPopup = sap.ui.xmlfragment(this.getView().getId(), "com.belote.fragment.updateUserName", this);
                        this.getView().addDependent(this._oUserPopup);
                    }

                    this._oUserPopup.open();
                } else {
                    sap.m.MessageToast.show("Content de vous revoir " + firebase.auth().currentUser.displayName, {
                        width: "40rem"
                    });
                }
            }
        }
    };
});