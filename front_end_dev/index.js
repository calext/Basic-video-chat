const m = require('mithril');
const sock = require('socket.io-client');
import './master.css'
//const {adapter}= require('webrtc-adapter')
var socket,
room
var doWait=false
var recipient=false
var localPeer

var index= {
  oncreate: function() {
    socket= sock('http://localhost:833', {
      path: '/here'
    })
    socket.on('connect', function() {
      console.log('connected');
      document.querySelector('.b').disabled=false
    })
    socket.on('recipient', function(bool) {
      recipient= bool
    })
    socket.on('r', function(dat) {
      if(dat=='square'){
        m.route.set('/videoChat')
      }else if(dat=='filled'){
        alert('that space is filled, Select another Input ID')
        document.querySelector('.i').select()
      }else{
        doWait= true
        m.route.set('/waiting')
      }
    })

  },
  view: function() {
    return[
      m('main.m', [
        m('label[for=id].l', 'Input ID'),
        m('input[type=text][name=id].i'),
        m('button.b[disabled=true]',{
          onclick: function() {
            var id= document.querySelector('.i').value
            if(id){
              socket.emit('new', id)
              room= id
            }
          }
        }, 'Start Video Call')
      ])
    ]
  }
}
var vchat= {
  oninit: function() {
    if(!socket)m.route.set('/index')
  },
  oncreate: function() {
     localPeer= new RTCPeerConnection({
      iceServers: [
        {
          url: 'stun:stun2.l.google.com:19302'
        }
        // ,{
        //   url: 'turn:turn.bistri.com:80',
        //   credential: 'homeo',
        //   username:'homeo'
        // }
      ]
    })

    //this.localPeer= localPeer

      localPeer.onicecandidate= function(e) {
        var iceCandidate= e.candidate
        if(iceCandidate){
          socket.emit('ice', iceCandidate, room)
        }
      }
    localPeer.addEventListener('iceconnectionstatechange', function(e) {
      //console.log('ice connection state change event');
    })
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    }).then(function(stream) {
      document.querySelector('.v1').srcObject= stream
      try{
      stream.getTracks().forEach(function(track){ localPeer.addTrack(track, stream) })
    }catch(err){
      throw err
    }
    }).then(function() {
      if(recipient){
        localPeer.createOffer().then(function(description) {
          localPeer.setLocalDescription(new RTCSessionDescription(description))
          socket.emit('desc', description, room)
        }, function(err) {
          throw err
        })
      }
    }, function(err) {
      throw err
    })
    socket.on('ice', function(iceC) {
      localPeer.addIceCandidate(iceC)
    })

    socket.on('desc', function(desc) {
      localPeer.setRemoteDescription(new RTCSessionDescription(desc))

      if(!recipient){
        localPeer.createAnswer().then(function(answer) {
          localPeer.setLocalDescription(new RTCSessionDescription(answer))
          socket.emit('desc', answer, room)
        })
      }

    })

    localPeer.addEventListener('track', function(e) {
      document.querySelector('.v2').srcObject= e.streams[0]
    })
  },
  view: function() {
    return[
      m('.base',[
        m('.chat_menu',[
          m('button.hang',{
            onclick: function(e) {
              localPeer.close()
              m.route.set('/index')
            }
          }, 'Hang up')
        ]),
      m('.holder', [
        m('video[autoplay=true].v1'),
        m('video[autoplay=true].v2')
      ])
    ])
    ]
  }
}
var wait= {
  oninit: function() {
    if(socket){
      socket.on('r', function(dat) {
        if(dat=='square'){
          m.route.set('/videoChat')
        }
      })
    }else{
      m.route.set('/index')
    }
    if(!doWait)m.route.set('/index')
    doWait=false
  },
  view: function() {
    return[
      m('main.wait_main',[
        m('h4', 'Waiting for second Peer...'),

          m('.node', [
            m('span.c')
          ])

      ])
    ]
  }
}
m.route(document.body, '/index',{
  '/index': index,
  '/videoChat': vchat,
  '/waiting': wait
})
