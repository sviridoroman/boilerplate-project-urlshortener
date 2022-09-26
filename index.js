require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const validURL = require('valid-url');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(cors());


app.use(cors());

const credential = require('./key.json');
const { query } = require('express');
admin.initializeApp({credential: admin.credential.cert(credential)});

const db = admin.firestore();

const createUrl = async (newUrl) => {
  try {
    console.log(newUrl);
    const response = db.collection('urls').add(newUrl);
    return response;
  } catch (error) {
    console.log(error);
  }
}

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// app.post('/api/shorturl', async (req, res) => {
//   let newUrl = req.body.url;

//   if(validURL.isWebUri(newUrl)) {
//     let foundedUrl = await UrlAddres.findOne({original_url: newUrl});
//     if (foundedUrl){
//       res.json({
//         original_url: foundedUrl.original_url,
//         short_url: foundedUrl.short_url
//       })
//     } else {
//        UrlAddres.find()
//        .then(url => {
//         new UrlAddres({
//           original_url: req.body.url,
//           short_url: url.length + 1
//         })
//         .save()
//         .then(
//           res.json({
//             original_url: req.body.url,
//             short_url: url.length + 1
//           })
//         )
//        })
//     }
//     } else {
//       res.json({
//         error: 'invalid URL'
//       })
//     }
// });

app.get('/api/shorturl/:selectedUrl?', async (req, res) => {
  if(parseInt(req.params.selectedUrl)){  
    let foundedUrl = await db.collection('urls').where('short_url', '==', (req.params.selectedUrl * 1)).get();
    if(!foundedUrl.empty){
      console.log('FOUNDED');
      foundedUrl.forEach(doc => {
        res.redirect(doc.data().original_url)
      })
  }
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

app.post('/api/shorturl', async (req, res) => {
  let newUrl = req.body.url;
  if (validURL.isWebUri(newUrl)){
    let foundedUrl = await db.collection('urls').where('original_url', '==', newUrl).get();
    if(!foundedUrl.empty){
      foundedUrl.forEach(doc => {
        res.json(doc.data())
      })
    }else{
      const querySnapshot = await db.collection('urls').get();
      const documents = querySnapshot.docs;
      let count = documents.length;
      let url = {
        original_url: newUrl,
        short_url: count + 1
      };
      createUrl(url)
      .then(res.json({
        original_url: url.original_url,
        short_url: count + 1
      })
      )
    }
  } else {
    res.json({
      error: 'invalid URL'
      })
  }
  // if(validURL.isWebUri(newUrl)) {
  //   let foundedUrl = await UrlAddres.findOne({original_url: newUrl});
  //   if (foundedUrl){
  //     res.json({
  //       original_url: foundedUrl.original_url,
  //       short_url: foundedUrl.short_url
  //     })
  //   } else {
  //      UrlAddres.find()
  //      .then(url => {
  //       new UrlAddres({
  //         original_url: req.body.url,
  //         short_url: url.length + 1
  //       })
  //       .save()
  //       .then(
  //         res.json({
  //           original_url: req.body.url,
  //           short_url: url.length + 1
  //         })
  //       )
  //      })
  //   }
  //   } else {
  //     res.json({
  //       error: 'invalid URL'
  //     })
  //   }
});