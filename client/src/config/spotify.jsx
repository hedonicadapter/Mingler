var SpotifyWebApi = require('spotify-web-api-node');

const redirectUri = 'http://localhost:1212';
const clientId = '5272130bae2b451e9a438f192f009112';

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
const spotifyApi = new SpotifyWebApi({
  redirectUri: redirectUri,
  clientId: clientId,
});

const refreshAccessToken = () => {
  spotifyApi.refreshAccessToken().then(
    function (data) {
      console.log('The access token has been refreshed!');

      localStorage.setItem('expires_in', data.body['expires_in']);
      localStorage.setItem('access_token', data.body['access_token']);

      spotifyApi.setAccessToken(data.body['access_token']);
    },
    function (e) {
      // console.log('Could not refresh access token', e);
    }
  );
};

export { spotifyApi, refreshAccessToken };
