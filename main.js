require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 4000;

app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use(session({
    secret: 'user in session',
    saveUninitialized: true,
    resave:false,
}))

app.use((req,res,next)=>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})


app.set('view engine','ejs');
app.use(express.static('public'));
app.use(express.static('uploads'));

mongoose.connect(process.env.DB_URI,{useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error',(error)=>{
    console.log(error);
})
db.once('open',()=> {
    console.log("Connected to the database")
});

app.use("/",require('./routes/routes'));
app.listen(port,()=>{
    console.log("Server Started at port "+port);
})