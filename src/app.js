import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { io } from "socket.io-client";
import Peer from 'peerjs';

// import { getRandomId } from './utils';
import StylsWarapper from "./appStyled";

const App = () => {
    useEffect(() => {
        const videoGrid = document.getElementById('video-grid');

        const socket = io('http://localhost:4040');
        const myPeer = new Peer(undefined, {
            host: '/',
            port: 4041
        });

        const myVideo = document.createElement('video')
        myVideo.muted = true
        const peers = {}
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then(stream => {
            addVideoStream(myVideo, stream)

            myPeer.on('call', (call) => {
                call.answer(stream)
                const video = document.createElement('video')
                call.on('stream', userVideoStream => {
                    addVideoStream(video, userVideoStream)
                })
            })

            socket.on('user-connected', userId => {
                connectToNewUser(userId, stream)
            })
        })

        socket.on('user-disconnected', userId => {
            if (peers[userId]) peers[userId].close()
        })

        myPeer.on('open', id => {
            socket.emit('join-room', 20, id);
        });

        function connectToNewUser(userId, stream) {
            const call = myPeer.call(userId, stream)
            const video = document.createElement('video')
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream)
            })
            call.on('close', () => {
                video.remove()
            })

            peers[userId] = call
        }

        function addVideoStream(video, stream) {
            console.log(videoGrid);
            video.srcObject = stream
            video.addEventListener('loadedmetadata', () => {
                video.play()
            })
            videoGrid.append(video)
        }
    }, [])

    return (
        <StylsWarapper>
            <div id="video-grid">
                <video />
            </div>
        </StylsWarapper>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));