import React, { useRef, useState, useEffect, use } from 'react'

import io from "socket.io-client";

import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';

import "../styles/VideoMeet.css";




var connections = {};

const surver_url = "http://localhost:8000";

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}


export function VideoMeet() {
    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(3);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])

    useEffect(() => {
        // console.log("HELLO")
        getPermissions();

    })




    let getUserMedia = () => {
        if ((videoAvailable && video) || (audioAvailable && audio)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(() => { }) // todo getmediasucess
                .then((stream) => { })
                .catch((error) => {
                    console.log("Error accessing media devices.", error);
                });

        }
        else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks();
                tracks.forEach(track => {
                    track.stop();
                })
            } catch (error) {
                console.error("Error stopping media tracks:", error);
            }
        }
    }

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [video, audio])


    const getMessageFromServer = (fromId, message) => {

    }


    // todo addMessage
    let addMessage = (data, sender, socketIdSender) => { }

    const connectToSocketServer = () => {
        socketRef.current = io.connect(surver_url, { secure: false });

        socketRef.current.on("signal", getMessageFromServer);

        socketRef.current.on("connect", () => {

            socketRef.current.emit("join-call", window.location.href);

            socketIdRef.current = socketRef.current.id;

            socketRef.current.on("chat-message", addMessage)

            socketRef.current.on("user-left", (id) => {
                setVideos((Videos) => Videos.filter((videos) => videos.socketId !== id));
            })

            socketRef.current.on("user-joined", (id, clients) => {
                clients.forEach((socketListId) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

                    connections[socketListId].onicecandidate = (event) => {
                        if (event.candidate === null) {
                            socketRef.current.emit("signal", socketListId,JSON({ 'ice': event.candidate}));

                        }
                    }

                    connections[socketListId].onaddStream = (event) => {
                        let videoExists = videos.find((video) => video.socketId === socketListId);
                        if(videoExists){
                            setVideos((videos) => videos.map((video) => {

                                const updatedVideos = videos.map((video) => {
                                    video.socketId == socketListId ? { ...video, stream: event.stream } : video;
                                })
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            }))
                        }
                        else{
                         let newVideo = {
                            socketId: socketListId,
                            stream: event.stream,
                            autoPlay: true,
                            playinline: true,

                         }
                         setVideos((videos) => {
                            updatedVideos = [...videos, newVideo];
                            videoRef.current = updatedVideos;
                            return updatedVideos;
                         } );
                        }
                    }

                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream);
                    }
                    else{

                    }

                })

                if(id === socketIdRef.current){
                   for (let id2 in connections) {
                      if( id2 ===  socketIdRef.current){
                        continue;
                      }
                      try{
                        connections[id2].addStream(window.localStream); 
                      }
                      catch(error){
                        // console.error("Error adding stream to connection:", error);
                      }

                      connections[id2].createOffer().then((offer) => {
                        connections[id2].setLocalDescription(offer).then(() => {

                            socketRef.current.emit("signal", id2, JSON.stringify({ 'sdp': connections[id2].localDescription }));        
                            
                        })
                        .catch((error) => {
                            console.error("Error setting local description:", error);
                        });

                      })
                      
                   }

                }


            })
        })
    }



    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    const getPermissions = async () => {
        try {
            // Check if video is available
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                // localVideoref.current.srcObject = videoPermission;
            }
            else {
                setVideoAvailable(false);
            }
            // Check if audio is available
            // Note: getUserMedia is the method used for audio and video permissions
            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
            }
            else {
                setAudioAvailable(false);
            }

            // Check if screen sharing is available
            // Note: getDisplayMedia is the method used for screen sharing
            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            }
            else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                // setAskForUsername(false);
                // Start the video stream
                const stream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                // localVideoref.current.srcObject = stream;
                if (stream) {
                    window.localStream = stream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = stream;
                    }
                }
            }

        } catch (error) {
            console.error("Error getting permissions:", error);
        }
    }

    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }

    return (
        <div>
            {askForUsername === true ?

                <div>


                    <h2>Enter into Lobby </h2>
                    <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
                    <Button variant="contained" onClick={connect} >Connect</Button>


                    <div>
                        <video ref={localVideoref} autoPlay muted></video>
                    </div>

                </div> : <></>
            }
        </div>
    )
}
