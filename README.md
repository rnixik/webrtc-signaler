# Signaling server for WebRTC

A WebSocket signaling server.

## List of ENV variables:

* PORT - listening port. Default 443.
* HTTPS_CERT_KEY - path to key of certificate to use HTTPS (WSS). Default empty (not WSS).
* HTTPS_CERT - path to certificate to use HTTPS (WSS). Default empty (now WSS).

## How to start

```
docker run --rm -it rnix/webrtc-signaler
```

## How to start for development

```bash
cp docker-compose.dist.yml docker-compose.yml
docker-compose up -d
sudo bash -c 'echo "127.0.0.1 webrtc.local signaler.local" >>/etc/hosts; echo "" >>/etc/hosts'
```

## How to use

```javascript
const socket = io('https://signaler.local:8881');
const myId = 'some-id'; // uuid or any other

// Join a room
socket.on('connect', () => {
    socket.emit('room', JSON.stringify({ id: myId, room: 'some-room' }));
});

// When somebody joins the room
socket.on('new', (remoteId) => {
  // Send signaling data
  this.socket.emit('webrtc', JSON.stringify({ 
    id: myId, 
    to: remoteId, 
    data: {} // signaling data (sdp, ice-candidate) 
  }));
});

// Get signaling data
socket.on('webrtc', (message) => {
  const signalingData = JSON.parse(message).data;
});
```

## License

The MIT License
