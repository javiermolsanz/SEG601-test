/* global OT API_KEY TOKEN SESSION_ID SAMPLE_SERVER_BASE_URL */

let apiKey;
let sessionId;
let token;
let publisher;
let session;
let subscriber;
let isSessionConnected = false;
let hasAudio;
let initialAudioPreference = true;

function handleError(error) {
  if (error) {
    console.error(error);
  }
}

if (API_KEY && TOKEN && SESSION_ID) {
  apiKey = API_KEY;
  sessionId = SESSION_ID;
  token = TOKEN;
  initializeSession();
} else if (SAMPLE_SERVER_BASE_URL) {
  //console.log(`number of users ${users}`)
  // Make an Ajax request to get the OpenTok API key, session ID, and token from the server
  fetch(SAMPLE_SERVER_BASE_URL + '/room/test')
    .then(function fetch(res) {
      return res.json();
    })
    .then(function fetchJson(json) {
      apiKey = json.apiKey;
      sessionId = json.sessionId;
      token = json.token;

      initializeSession();
    })
    .catch(function catchErr(error) {
      handleError(error);
      alert(
        'Failed to get opentok sessionId and token. Make sure you have updated the config.js file.'
      );
    });
}

function initializeSession() {
  const button = document.getElementById('button');

  button.addEventListener('click', function(e) {
    toggleAudio();
  });

  let publisherInitialized = false;
  let connected = false,
    session = OT.initSession(apiKey, sessionId);
  session.connect(token, function callback(error) {
    if (error) {
      handleError(error);
    }
    connected = true;
  });

  const publisher = OT.initPublisher(
    'publisher',
    { publishVideo: false, publishAudio: initialAudioPreference },
    function(err) {
      if (err) {
        // handle error
      } else {
        publisherInitialized = true;
        publish();
      }
    }
  );

  publisher.on('streamCreated', function(event) {
    console.log(
      'Stream created with ' + event.stream.hasAudio + ' publishAudio'
    );
    const initialAudioState = event.stream.hasAudio;
    hasAudio = initialAudioState;
    toggleButton(event.stream.hasAudio);
  });

  const publish = function() {
    if (connected && publisherInitialized) {
      session.publish(publisher);
    }
  };

  const toggleAudio = () => {
    if (hasAudio) {
      publisher.publishAudio(false);
      hasAudio = false;
    } else {
      publisher.publishAudio(true);
      hasAudio = true;
    }
  };

  const toggleButton = value => {
    console.log('toggling button');
    if (value === true) {
      button.innerHTML = 'Mute';
    } else {
      button.innerHTML = 'Unmute';
    }
  };

  session.on('streamPropertyChanged', function sessionDisconnected(event) {
    console.log('Property changed', event);
    if (event.changedProperty === 'hasAudio') toggleButton(event.newValue);
  });
}

// See the config.js file.
