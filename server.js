//import express ws E#

const express = require('express');
const request = require('request');
const path = require('path');

const SocketServer = require('ws').Server;

const PORT = 9020;

const app = express()
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

app.get("/api", (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
  console.log(req.query);
  if(req.query){
    request("localhost:8080/"+req.query.command, (e,r,b) => {
      if(!e){
        console.log(b)
      }
      else {
        console.log(e)
      }
    })
  }
  // res.send("<form action='/' method='get'>API : <input name='command'/> <button>send</button></form>")
});
