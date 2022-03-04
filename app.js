const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();
const server = require('http').Server(app);

const request = require('request');
const pug = require('pug');
const _ = require('lodash');
const path = require('path');
const {Payment} =  require('./models/payment');
const { response } = require('express');
const { rmdirSync } = require('fs');
const {initializePayment, verifyPayment} = require ('./config/paystack') (request);

let port = process.env.PORT || 3000;


// express config
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public/')));
app.set('view engine', pug);

app.get('/',(req, res) => {
  res.render('index.pug');
  });

app.post('/paystack/pay', (req, res) => {
  const form = _.pick(req.body,['amount','email','full_name']);
  form.metadata = {
      full_name : form.full_name
  }
  form.amount *= 100;
  initializePayment(form, (error, body)=>{
      if(error){
          //handle errors
          console.log(error);
          return;
      }
     const response = JSON.parse(body);
      res.redirect(response.data.authorization_url)
  });
});

app.get('/paystack/callback', (req,res) => {
  const ref = req.query.reference;
  verifyPayment(ref, (error,body) =>{
    if(error) {
      // handle errors appropriately
      console.log(error)
      return res.redirect('/error');
    }
     const response = JSON.parse(body);

    const data = _.at(response.data,
      ['reference',
       'amount',
       'customer.email',
       'metadata.full_name'
      ]);
      [reference,amount,email,full_name] = data;
      newPayment = {reference,amount,email,full_name} 

      const payment = new Payment(newPayment)
      payment.save().then((payment)=> {
        if(payment) {
          res.redirect('/receipt/'+payment._id);
        }
      }).catch((e) =>{
        res.redirect('/error');
      })

  })
});
app.get('/receipt/:id', (req, res)=>{
  const id = req.params.id;
  Payment.findById(id).then((payment)=>{
      if(!payment){
          //handle error when the client is not found
          res.redirect('/error')
      }
      res.render('success.pug',{payment});
  }).catch((e)=>{
      res.redirect('/error')
  })
})

app.get('/error', (req, res)=>{
  res.render('error.pug');
})

// webhook
// app.post('/feedback', (req,res) => {
//   console.log(req.body)
//   rmdirSync.status(200).end()
// })





// Database and Server connections!
mongoose.connect(process.env.MONGO_URI,{
  useNewUrlParser:true, 
  useUnifiedTopology:true, 
})
.then(response =>{
  server.listen(port, ()=>{
    console.log('server is running:listening on port 🚀 ' + port);
  })
  console.log('All connections sucessful!🚀')
}).catch((err)=>{
  console.log('Database connection failed: unable to establish connections 😢')
  console.log(err)
})

module.exports = server