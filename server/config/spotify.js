var SpotifyWebApi = require('spotify-web-api-node');

const redirectUri = 'http://localhost:1212';
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
exports.spotifyApi = new SpotifyWebApi({
  redirectUri: redirectUri,
  clientId: clientId,
  clientSecret: clientSecret,
});

const refresh = (expires_in) => {
  spotifyApi.refreshAccessToken().then(
    function (data) {
      console.log('The access token has been refreshed!');

      // localStorage.setItem('expires_in', data.body['expires_in']);
      // localStorage.setItem('access_token', data.body['access_token']);

      spotifyApi.setAccessToken(data.body['access_token']);
      // refresh(expires_in);
    },
    function (e) {
      // console.log('Could not refresh access token', e);
    }
  );
};
