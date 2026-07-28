const fs = require('fs');
fetch('https://docs.google.com/spreadsheets/d/1202j3dJ_p-6_424X9v/pub?output=csv')
  .then(res => res.text())
  .then(text => {
    fs.writeFileSync('headers.txt', text.split('\n')[0]);
    console.log('done');
  })
  .catch(console.error);
