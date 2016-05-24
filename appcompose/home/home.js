(function(){
  'use strict';

  // The initialize function must be run each time a new page is loaded
  Office.initialize = function(reason){
    jQuery(document).ready(function(){
      app.initialize();
      jQuery('#start-game').click(startGame);
      jQuery('#next-player').click(nextPlayer);
    });
  };

  function startGame() {
    var item = Office.cast.item.toItemCompose(Office.context.mailbox.item);
    item.to.getAsync(function(result) {
      if (result.error) {
        app.showNotification(result.error);
      } else {
		var recipients = result.value;
        var color = 0;
        var board = new Board();
        recipients.forEach(function(recip, index) {
	      board.players.push(Player.create(recip.displayName, recip.emailAddress, color++));
        });
		var userProfile = Office.context.mailbox.userProfile;
	    board.players.push(Player.create(userProfile.displayName, userProfile.emailAddress, color++));
	    var json = JSON.stringify(board);
        item.body.setAsync(Base64.encode(json), function(result) {
          if (result.error) {
            app.showNotification(result.error);
          } else {
            var newRecipient = recipients[0];
            Office.context.mailbox.item.to.setAsync([newRecipient], function(result) {
              if (result.error) {
                app.showNotification(result.error);
              } else {
                 Office.context.mailbox.item.subject.setAsync("[Carcassonne]");
              }
            });
          }
        });
      }
    });
  }

  function nextPlayer() {
    var item = Office.cast.item.toItemCompose(Office.context.mailbox.item);
    item.body.getAsync(Office.CoercionType.Text, function (result) {
      if (result.error) {
        app.showNotification(result.error);
      } else {
		var position = result.value.indexOf("****");
		var cutBody = result.value.substring(0, position);
        Office.context.mailbox.item.body.setAsync(cutBody + "****", function() {});

        var game = JSON.parse(Base64.decode(cutBody));
		var email = Office.context.mailbox.userProfile.emailAddress;
        var newRecipient = findNextPlayer(game.players, email);
        Office.context.mailbox.item.to.setAsync([newRecipient.email], function() {});
      }
    });

  }

  function findNextPlayer(players, email) {
    var index = _.indexOf(players,
		_.find(players, function(p) { return email === p.email; }));
	return players[(index + 1) % players.length];
  }

})();
