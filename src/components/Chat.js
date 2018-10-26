import React from 'react'

import './chat.css'

const Chat = ({ src, group, body, caption, timestamp, preview, filename = ''}) => {
    const isMedia = filename.match(/.(mp4|jpe)/)
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
        {isMedia && (
            <div className="bubble">
            <a className="media" href={filename}>
            {caption && <p className="message">{caption}</p>}
            <img src={`data:image/jpeg;base64,${preview}`} />
                         </a>
                         <div className="bubble-arrow"></div>
        </div>
        )}
        </div>
    )
}

export default Chat
