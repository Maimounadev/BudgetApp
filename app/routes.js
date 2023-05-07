module.exports= function(app,passport,db){

  app.get('/', function(req, res) {
          res.render('index.ejs');
      });
  app.get("/account", (req,res) => {
      const name = req.query.name;
      db.collection("new").find({name:name},{current:1}).toArray(function(err,result){//only returning current property as a filter 
      if (err) return console.log(err)
      res.send(result)
    })
  })
  //using query paramter like we did basic node
  app.post("/account", (req, res) => {
    db.collection('new')
    .save({name: req.body.name, current: Number(req.body.current),transactions:[["Deposit:",Number(req.body.current)]]}, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/profile')
    })
  })
  //saving req.body.name, deposit amount, and array with the initial deposit as first index
  app.put('/account', (req, res) => {
    if("deposit" in req.body){
      db.collection('new')
      .findOneAndUpdate({name: req.body.name}, {
        $inc: {
          current: req.body.deposit
        },
         $push: {
           transactions: [req.body.reason,req.body.deposit]
         }
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    }else if("withdrawal" in req.body){
      db.collection('new')
      .findOneAndUpdate({name: req.body.name}, {
        $inc: {
          current: req.body.withdrawal
        },
        $push: {
          transactions: [req.body.reason,req.body.withdrawal]
        }
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    }
  })
  //first time using if() logic in app.post/put sucessfully
  //two fetches with main.js and checking for the withdraw/deposit property for the two puts and executes the proper put using if()
  //used increment and push instead of set, increment adds the value to the property while push appends to the array, first index will not be altered from post because it is being pushed and not altering or setting
  app.delete('/account', (req, res) => {
    db.collection('new').findOneAndDelete({name: req.body.name}, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  });
  //delete method using the account name pulling from a data attribute for each account
  //tried using req.body._id but couldn't pull it from data attribute
  
  app.get('/profile', isLoggedIn, function(req, res) {
      db.collection('new').find().toArray((err, result) => {
        if (err) return console.log(err)
        res.render('profile.ejs', {
          user : req.user,
          remaining: result
        })
      })
  });

  // LOGOUT ==============================
  app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
  });
  //LOGGING IN ===========================
  app.get('/login', function(req, res) {
              res.render('login.ejs', { message: req.flash('loginMessage') });
          });

  // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }))
    // SIGNUP =================================
    // show the signup form
    app.get('/signup', function(req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    })
    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    //function to check if logged in
    function isLoggedIn(req, res, next) {
      if (req.isAuthenticated())
          return next();

      res.redirect('/');
  }

}
