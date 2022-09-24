require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const validURL = require('valid-url');
const bodyParser = require('body-parser');
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(cors());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

let urlAddresSchema  = new mongoose.Schema({
  original_url: String,
  short_url: Number
})

let UrlAddres = mongoose.model('UrlAddres', urlAddresSchema);

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res) => {
  let newUrl = req.body.url;

  if(validURL.isWebUri(newUrl)) {
    let foundedUrl = await UrlAddres.findOne({original_url: newUrl});
    if (foundedUrl){
      res.json({
        original_url: foundedUrl.original_url,
        short_url: foundedUrl.short_url
      })
    } else {
       UrlAddres.find()
       .then(url => {
        new UrlAddres({
          original_url: req.body.url,
          short_url: url.length + 1
        })
        .save()
        .then(
          res.json({
            original_url: req.body.url,
            short_url: url.length + 1
          })
        )
       })
    }
    } else {
      res.json({
        error: 'invalid URL'
      })
    }
});

app.get('/api/shorturl/:selectedUrl?', async (req, res) => {
  if(parseInt(req.params.selectedUrl))
{  let url = await UrlAddres.findOne({short_url: (req.params.selectedUrl * 1)});
  if (url)
  res.redirect(url.original_url);
  else
  res.json({
    error: 'invalid URL'
  })
}else
res.json({
  error: 'invalid URL'
})
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
