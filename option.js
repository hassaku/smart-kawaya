$(document).ready(function() {
  $('#access_token').val(localStorage["accessToken"]);

  $('#save_access_token').on('click', function() {
    localStorage["accessToken"] = $('#access_token').val()
    $('#result_access_token').html("saved " + $('#access_token').val() + "as access token.").fadeOut(3000);
  });
});
