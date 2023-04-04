//Install express server
const express = require('express');
const path = require('path');
const db = require('./query')


const app = express();

app.use(express.static(__dirname + '/dist/dvf'));

app.get('/countMutations',db.getCountMutations)
app.get('/', function(req,res) {
    
res.sendFile(path.join(__dirname+'/dist/dvf/index.html'));
});

app.listen(process.env.PORT || 8080);