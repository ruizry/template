const secrets = {
    'db_uri': 'mongodb://rysdev:rareware@ds247619.mlab.com:47619/rysdev',
};
  
module.exports = {
    requestSecret: function(s) {
      return secrets[s];
    },
};
