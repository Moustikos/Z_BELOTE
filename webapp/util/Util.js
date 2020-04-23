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
        
        _shuffleCards : function(that, bFull) {
        	// Get local model
        	var oLocalModel = that.getView().getModel("localModel");
        	
        	// Get playing cards or initiale the deck
        	if(oLocalModel.getProperty("/PlayingCards") !== [] && oLocalModel.getProperty("/PlayingCards")) {
        		aCard = oLocalModel.getProperty("/PlayingCards");
        	} else {
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
				
				oLocalModel.setProperty("/PlayingCards", aCard);
        	}
        	
			// Start firebase updates
			var updates = {};
			
			if(!bFull) {
				// Three first cards
				for(var i = 0; i < 3; i++) {
					updates["/NTeams/0/NPlayers/0/NCards/" + i] = {
						Name : aCard[i].Name
					};
					firebase.database().ref("ETTableSet/0/NTeams/0/NPlayers/0/NCards/" + (i + 5)).remove();
				}
				
				for(var j = 0; j < 3; j++) {
					updates["/NTeams/0/NPlayers/1/NCards/" + j] = {
						Name : aCard[j+3].Name
					};
					
					firebase.database().ref("ETTableSet/0/NTeams/0/NPlayers/1/NCards/" + (j + 5)).remove();
				}
				
				for(var k = 0; k < 3; k++) {
					updates["/NTeams/1/NPlayers/0/NCards/" + k] = {
						Name : aCard[k+6].Name
					};
					
					firebase.database().ref("ETTableSet/0/NTeams/1/NPlayers/0/NCards/" + (k + 5)).remove();
				}
				
				for(var l = 0; l< 3; l++) {
					updates["/NTeams/1/NPlayers/1/NCards/" + l] = {
						Name : aCard[l+9].Name
					};
					
					firebase.database().ref("ETTableSet/0/NTeams/1/NPlayers/1/NCards/" + (l + 5)).remove();
				}
				
				// Two second cards
				for(var i2 = 3; i2 < 5; i2++) {
					updates["/NTeams/0/NPlayers/0/NCards/" + i2] = {
						Name : aCard[i2 + 9].Name
					};
				}
				
				for(var j2 = 3; j2 < 5; j2++) {
					updates["/NTeams/0/NPlayers/1/NCards/" + j2] = {
						Name : aCard[j2+11].Name
					};
				}
				
				for(var k2 = 3; k2 < 5; k2++) {
					updates["/NTeams/1/NPlayers/0/NCards/" + k2] = {
						Name : aCard[k2+13].Name
					};
				}
				
				for(var l2 = 3; l2< 5; l2++) {
					updates["/NTeams/1/NPlayers/1/NCards/" + l2] = {
						Name : aCard[l2+15].Name
					};
				}
				
				updates["/SuggestedCard"] = aCard[20].Name;
				updates["/DoneFinished"] = false;
			}
			
			firebase.database().ref("ETTableSet/0").update(updates);
        }
    };
});