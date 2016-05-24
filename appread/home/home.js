(function(){
  'use strict';

  // The Office initialize function must be run each time a new page is loaded
  Office.initialize = function(reason){
    jQuery(document).ready(function(){
      app.initialize();

      // displayItemDetails();

      processBody();
    });
  };

  // Displays the "Subject" and "From" fields, based on the current mail item
  function displayItemDetails(){
    var item = Office.cast.item.toItemRead(Office.context.mailbox.item);
    jQuery('#subject').text(item.subject);

    var from;
    if (item.itemType === Office.MailboxEnums.ItemType.Message) {
      from = Office.cast.item.toMessageRead(item).from;
    } else if (item.itemType === Office.MailboxEnums.ItemType.Appointment) {
      from = Office.cast.item.toAppointmentRead(item).organizer;
    }

    if (from) {
      jQuery('#from').text(from.displayName);
      jQuery('#from').click(function(){
        app.showNotification(from.displayName, from.emailAddress);
      });
    }
  }

  function processBody() {
    var item = Office.cast.item.toItemRead(Office.context.mailbox.item);
    item.body.getAsync("text", function(result) {
      if (result.status === "succeeded") {
        var game = Base64.decode(result.value);
		initializeUI("../..",
				Office.context.mailbox.userProfile.emailAddress,
				game, function(nextPlayerEmail, state) {
          item.displayReplyForm({
			htmlBody: Base64.encode(state) + "****",
			callback: handleRespond });
		});
      } else {
        app.showNotification('Error getting body');
      }
    });
  }

  function handleRespond(result) {
    //if (result.status === "succeeded") {
    //  app.showNotification('HandleRespond ' + result);
    //} else {
    //  app.showNotification('Error opening respond');
    //}
  }

})();