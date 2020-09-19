//importing
import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from "pusher";

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

//can use cors instead of all this thing
app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers","*");
    next();
})

//DB config
const connection_url="mongodb+srv://admin:2DN5tcpCw5EOCJtZ@cluster0.fs8iy.mongodb.net/whatsappdb?retryWrites=true&w=majority";
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
});



//api routes
app.get('/',(req,res)=>res.status(200).send('hello world'));

app.post('/messages/new',(req,res)=>{
    const dbMessage=req.body

    Messages.create(dbMessage,(err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

app.get('/messages/sync',(req,res)=>{
    Messages.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(data)
        }
    })
})


//listener
app.listen(port,()=>console.log(`listening on ${port}`));