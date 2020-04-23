/*****************************************************************************************************************
* File description         : The util file contains all util functions
* Modification description : MOUSTIKOS - 23.04.2020 - Creation                                    
*****************************************************************************************************************/

sap.ui.define([], function() {
    "use strict";
    return {
        _convertFirebaseToJSON : function(snapshot) {
        	var oEntry = {};
        	
        	// Convert object property into array for binding purpose
        	snapshot.forEach(function (oProperty) {
				 if(typeof(oProperty.toJSON()) !== "object") {
				 	oEntry[oProperty.key] = oProperty.toJSON();
				 } else {
				 	// Special case for NTeams navigation link
				 	oEntry[oProperty.key] = [oProperty.toJSON()[0], oProperty.toJSON()[1]];
				 	
				 	oEntry[oProperty.key][0].NPlayers = [oProperty.toJSON()[0].NPlayers[0], oProperty.toJSON()[0].NPlayers[1]];
				 	oEntry[oProperty.key][1].NPlayers = [oProperty.toJSON()[1].NPlayers[0], oProperty.toJSON()[1].NPlayers[1]];
				 	
				 	var aCardsPlayer1 = [];
				 	var aCardsPlayer2 = [];
				 	var aCardsPlayer3 = [];
				 	var aCardsPlayer4 = [];
				 	
				 	for(var i = 0; i < Object.keys(oEntry[oProperty.key][0].NPlayers[0].NCards).length; i++) {
				 		aCardsPlayer1.push(oEntry[oProperty.key][0].NPlayers[0].NCards[Object.keys(oEntry[oProperty.key][0].NPlayers[0].NCards)[i]]);
				 	}
				 	oEntry[oProperty.key][0].NPlayers[0].NCards = aCardsPlayer1;
				 	
				 	for(var j = 0; j < Object.keys(oEntry[oProperty.key][0].NPlayers[1].NCards).length; j++) {
				 		aCardsPlayer2.push(oEntry[oProperty.key][0].NPlayers[1].NCards[Object.keys(oEntry[oProperty.key][0].NPlayers[1].NCards)[j]]);
				 	}
				 	oEntry[oProperty.key][0].NPlayers[1].NCards = aCardsPlayer2;
				 	
				 	for(var k = 0; k < Object.keys(oEntry[oProperty.key][0].NPlayers[0].NCards).length; k++) {
				 		aCardsPlayer3.push(oEntry[oProperty.key][1].NPlayers[0].NCards[Object.keys(oEntry[oProperty.key][1].NPlayers[0].NCards)[k]]);
				 	}
				 	oEntry[oProperty.key][1].NPlayers[0].NCards = aCardsPlayer3;
				 	
				 	for(var l = 0; l< Object.keys(oEntry[oProperty.key][1].NPlayers[1].NCards).length; l++) {
				 		aCardsPlayer4.push(oEntry[oProperty.key][1].NPlayers[1].NCards[Object.keys(oEntry[oProperty.key][1].NPlayers[1].NCards)[l]]);
				 	}
				 	oEntry[oProperty.key][1].NPlayers[1].NCards = aCardsPlayer4;
				 }
            });
            
            return oEntry;
        },
        
        _shuffleCards : function(that) {
        	// Get local model
        	var oLocalModel = that.getView().getModel("localModel");
        	
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
			
			var updates = {};
			
			for(var i = 0; i < 8; i++) {
				updates["/NTeams/0/NPlayers/0/NCards/" + i] = {
					Name : aCard[i].Name
				};
			}
			
			for(var j = 0; j < 8; j++) {
				updates["/NTeams/0/NPlayers/1/NCards/" + j] = {
					Name : aCard[j+8].Name
				};
			}
			
			for(var k = 0; k < 8; k++) {
				updates["/NTeams/1/NPlayers/0/NCards/" + k] = {
					Name : aCard[k+16].Name
				};
			}
			
			for(var l = 0; l< 8; l++) {
				updates["/NTeams/1/NPlayers/1/NCards/" + l] = {
					Name : aCard[l+24].Name
				};
			}
			
			// Update player entityset
			oLocalModel.setProperty("/PlayTable/NTeams/0/NPlayers/0/NCards", aCard.splice(0,8));
			oLocalModel.setProperty("/PlayTable/NTeams/0/NPlayers/1/NCards", aCard.splice(9,16));
			oLocalModel.setProperty("/PlayTable/NTeams/1/NPlayers/0/NCards", aCard.splice(17,24));
			oLocalModel.setProperty("/PlayTable/NTeams/1/NPlayers/1/NCards", aCard.splice(25,32));
			
			firebase.database().ref("ETTableSet/0").update(updates);
        }
    };
});