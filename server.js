var express = require('express')
var app = express();

var bodyParser = require('body-parser');

var Datastore = require('nedb');
var db = new Datastore({ filename: 'gists.db', autoload: true });
db.persistence.setAutocompactionInterval(86400000);


app.use(express.static(__dirname + '/public'));
app.use(bodyParser());

app.post('/save', function (req, res) {
    req.body.modifiedTime = Date.now();
    db.insert(req.body, function (err, newDoc) {
        res.send((err === null) ? newDoc._id : 'Error ' + data + ' ' + err);
    });
    return "other";
});

app.get('/api/gist/id/:id', function (req, res) {
    db.find({ _id: req.params.id }, function (err, docs) {
        if (err != null)
            res.send(404, err);
        else if (docs.length == 0)
            res.send(404, "Could not find gist");
        else
            res.send(200, docs[0]);
    });
});

app.get('*', function (req, res) {
    res.sendfile('./public/index.html');
});

var port = 8080;
app.listen(port);
console.log('Server running at 127.0.0.1:' + port);