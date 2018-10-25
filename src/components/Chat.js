import React from 'react'

import './chat.css'

const Chat = ({ src, group, body, caption, timestamp}) => {
    return (
        <div className="msg">
            <div className="bubble">
                <div className="txt">
                    <span className="name">+{src}<span> ~ {group}</span></span>
                    <span className="timestamp">{timestamp}</span>
                    <p className="message">{caption ? caption : body}</p>
                </div>
                <div className="bubble-arrow"></div>
            </div>
        </div>
    )
}

export default Chat
