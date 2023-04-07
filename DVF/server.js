//Install express server
const express = require('express');
const path = require('path');
const db = require('./query')
var bodyParser = require('body-parser')

const app = express();

app.use(express.static(__dirname + '/dist/dvf'));
app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  )
app.get('/', function(req,res) {
    res.sendFile(path.join(__dirname+'/dist/dvf/index.html'));
});
app.get('/api/count/mutations/:codeinsee',db.getCountMutations)
app.get('/api/count/typelocal/:codeinsee',db.getCountTypeLocal)

app.listen(process.env.PORT || 8080);