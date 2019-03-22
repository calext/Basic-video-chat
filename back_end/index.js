const express = require('express');
const soc = require('socket.io');

let app= express()
let server= app.listen(833)

app.use(express.static('front_end_bundle'))
let chats={}
const io= soc(server, {
  path: '/here'
})
io.on('connection', (socket) => {
  socket.on('new', (data) => {
    if(chats[data]){
      if(chats[data].no==1){
        socket.join(data)
        socket.to(data).emit('recipient', true)
        io.to(data).emit('r', 'square')
        chats[data].no=2
      }else if(chats[data].no==2){
        socket.to('data').emit('r', 'filled')
      }
  }else{
      socket.join(data)
      chats[data]={name: data, no: 1}
      io.to(data).emit('r', 'yet')
    }
  })
  socket.on('ice', (iceCandidate, room) => {
    socket.to(room).emit('ice', iceCandidate)
  })
  socket.on('desc', (description, room) => {
    socket.to(room).emit('desc', description)
  })
})
