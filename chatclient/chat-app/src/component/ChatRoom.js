import React, { useState } from 'react'
import {over} from 'stompjs'
import SockJS from 'sockjs-client';

var stompClient = null;
const ChatRoom = () => {

    const [publicChats, setPublicChats] = useState([]);
    const [privateChats, setPrivateChats] = useState(new Map());
    const [userData, setUserData] = useState({
        username:"",
        recievername:"",
        connected: false,
        message:""
    })

    const handleUserName = (event) => {
        const {value} = event.target;
        setUserData({...userData, "username": value});
    }

    const registerUser = () => {
        let Sock = new SockJS('https://localhost:8080/ws');
        stompClient = over(Sock);
        stompClient.connect({}, onConnected, onError);
    }

    const onConnected = () => {
        setUserData({...userData, "connected": true});
        stompClient.subscribe('/chatroom/public', onPublicMessageReceived);
        stompClient.subscribe('/user/' + userData.username + '/private', onPrivateMessageReceived);
    }

    const onError = (err) => {
        console.log(err);
    }

    const onPublicMessageReceived = (payload) => {
        let payloadData=JSON.parse(payload.body);
        switch(payloadData.status) {
            case "JOIN":
                if (privateChats.get(payloadData.senderName)){
                    privateChats.get(payloadData.senderName, []);
                    setPrivateChats(new Map(privateChats));
                }
                break;
            case "MESSAGE":
                publicChats.push(payloadData);
                setPublicChats([...publicChats]);
                break;
            
        }
    }

    const onPrivateMessageReceived = (payload) => {
        let payloadData=JSON.parse(payload);
        if (privateChats.get(payloadData.senderName)){
            privateChats.get(payloadData.senderName).push(payloadData);
            setPrivateChats(new Map(privateChats));
        } else {
            let list = [];
            list.push(payloadData);
            privateChats.get(payloadData.senderName, list);
            setPrivateChats(new Map(privateChats));
        }
    } 

    return (
        <div className="container">
            {userData.connected?
            <div></div>
            :
            <div className='register'>
                <input
                id='user-name'
                placeholder='Enter the user name'
                value={userData.username}
                onChange={handleUserName}
                />
                <button type='button' onClick={registerUser}>
                    connect
                </button>
            </div>}

        </div>
    )
}

export default ChatRoom