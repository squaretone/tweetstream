// Demo using TweetStream client and jQuery
(function(TweetStream, $) {
  var base, title, tweets, messages;

  // Maximum number of tweets to display
  var maxTweets = 10;

  // Do setup based on configs passed back from Socket.io
  var setupWidget = function(config) {
    console.log('setup with config', config);
    var hashTags = config.streamParams.track;
    $('.tracking', base).remove();
    var trackingTags = '';
    $(hashTags).each(function(id, hashTag) {
      trackingTags += '<span class="label label-default">#' + hashTag + '</span>&nbsp;';
    });
    var trackingDetails = '<small class="tracking"><br />tracking ' + trackingTags + '</small>';
    $(trackingDetails).appendTo(title);

    // If there is a buffer of tweets sent, add those to the ui
    if (config.prime) {
      $(config.prime).each(function(id, tweetObj) {
        console.log('priming tweet: ', tweetObj);
        handleTweet(tweetObj);
      });
    }
  };

  // Add any status messages to the .messages div
  var handleStatusMessage = function(statusMsg) {
    if (messages.length) {
      console.log('prepend message:', statusMsg);

      // Create a timeStamp
      var timeStamp = '';
      var date = new Date();
      timeStamp += date.getHours();
      var minutes = date.getMinutes();
      if (minutes < 10) minutes = '0' + minutes;
      var seconds = date.getSeconds();
      if (seconds < 10) seconds = '0' + seconds;
      timeStamp += ':' + minutes;
      timeStamp += ':' + seconds;

      // Craft the message
      var msg =  '<div class="alert alert-info" role="alert">';
          msg += '  <span class="alert-link">';
          msg += '    <span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span>&nbsp;';
          msg += '    <em>' + timeStamp + '</em>&nbsp;';
          msg +=      statusMsg;
          msg += '  </span>';
          msg += '</div>';

      $(msg).prependTo(messages);
    }
  };

  // Template function for formatting tweet object
  var formatTweet = function(tweetObject) {
    var html = '';
    var text = tweetObject.text;
    var name = tweetObject.user.name;
    var username = tweetObject.user.screen_name;
    var profileImg = tweetObject.user.profile_image_url_https;

    html += '<div class="tweet media">';
    html += ' <div class="media-left">';
    html += '   <img class="media-object" src="' + profileImg + '" alt="profile image" />';
    html += ' </div>';
    html += ' <div class="media-body">';
    html += '   <h5 class="media-heading">' + name + ' <small>(' + username + ')</small></h5>';
    html +=     text;
    html += ' </div>';
    html += '</div>';

    return html;
  };

  // Append tweet to DOM
  var handleTweet = function(tweetObject) {
    console.log(tweetObject);
    var tweet = formatTweet(tweetObject);
    $(tweet).prependTo(tweets).hide().fadeIn('slow');
    if (tweets.length) {
      trimTweets();
    }
  };

  // Checks if we are displaying too many tweets and trims them
  var trimTweets = function() {
    var currentTweets = $('.tweet', tweets);
    var tweetCount = currentTweets.length;
    if (tweetCount > maxTweets) {
      $(currentTweets).each(function(id, tweetElement) {
        if (id >= maxTweets) {
          // Remove tweet
          $(tweetElement).remove();
        }
      });
    }
  };

  var init = function() {
    // Target DOM elements
    base = $('#jquery-demo');
    title = base.find('.title');
    messages = base.find('.messages');
    tweets = base.find('.tweets');

    TweetStream.connect({}, function(err, socket) {
      // Setup socket event listeners
      socket.on('connect', function(data) {});
      socket.on('config', setupWidget);
      socket.on('status', handleStatusMessage);
      socket.on('tweet', handleTweet);

      socket.on('error', function(err) {
        console.warn('Twitter error: ' + err);
      });
    });
  };

  $(function() {
    init();
  });

})(TweetStream, jQuery);
