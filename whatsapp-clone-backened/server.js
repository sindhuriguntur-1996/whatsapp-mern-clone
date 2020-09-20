//importing
import express from "express";
//import mongoose from "mongoose";
//import Messages from "./dbMessages.js";
import Pusher from "pusher";
import mySql from "mysql";
import bodyParser from "body-parser";


//app config
const app = express();
const port = process.env.PORT || 9000

var pusher = new Pusher({
    appId: '1075677',
    key: '719407b4efc30e9398ae',
    secret: '05ade22cd53815b7a4c1',
    cluster: 'eu',
    encrypted: true
  });

//middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))

//can use cors instead of all this thing
app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers","*");
    next();
})

//DB config
/*const connection_url="mongodb+srv://admin:2DN5tcpCw5EOCJtZ@cluster0.fs8iy.mongodb.net/whatsappdb?retryWrites=true&w=majority";
mongoose.connect(connection_url,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
})

const db=mongoose.connection

db.once('open',()=>{
    console.log('Db connected');

    const msgcollection=db.collection('messagecontents')
    const changeStream=msgcollection.watch();

    changeStream.on('change', (change)=>{
        console.log(change);

        if(change.operationType==="insert"){
            const messageDetails=change.fullDocument;
            pusher.trigger("messages","inserted",{    
                name:messageDetails.name,
                message:messageDetails.message,
                timeStamp:messageDetails.timeStamp,
                received:messageDetails.received,
            });
        }else{
            console.log('error')
        };
    });
});*/

const con = mySql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    insecureAuth : true,
    database: "mydb",
    table:"whatsapp"
  });

  //var sql = "CREATE TABLE customers (name VARCHAR(255), address VARCHAR(255))";

  
    /*con.query("CREATE DATABASE mydb", function (err, result) {
        if (err) throw err;
        console.log("Database created");

      });*/
     /* var sql = "CREATE TABLE whatsapp (name VARCHAR(255), message VARCHAR(255))";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });*/
  

//api routes
app.get('/',(req,res)=>res.status(200).send('hello world'));

//app.post('/messages/new',(req,res)=>{
  //  const dbMessage=req.body

  /* Messages.create(dbMessage,(err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})*/


app.post('/messages/newmessage',(req,res)=>{
    let name=req.body.name;
    let message=req.body.message;
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
          
    let insertquery="INSERT INTO `whatsapp` (`name`, `message`) VALUES ('"+req.body.name+"','"+req.body.message+"')"
    con.query("Insert INTO `whatsapp` (`name`,`message`) VALUES ('"+req.body.name+"','"+req.body.message+"')", function (err, result) {
        if(err){
            res.status(500).send(err)
            console.log(err);
        }else{
            res.status(200).send(JSON.stringify(result));
            console.log("sent",name,message);
            
        }
      });
    });
})

//app.get('/messages/sync',(req,res)=>{
 /*  Messages.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(data)
        }
    })*/
    app.get('/messages/synch',(req,res)=>{
      //  con.connect(function(err) {
        //    if (err) throw err;
            con.query("SELECT * FROM whatsapp", function (err, result, fields) {
                if(err){
                    res.status(500).send(err)
                    console.log(err);
                }else{
                    res.status(201).send(result);
                    console.log("received",result);
                    
                }
        //  });
})});


//listener
app.listen(port,()=>console.log(`listening on ${port}`));