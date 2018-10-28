import React from 'react'

import groupIcon from './account-multiple.svg'
import userIcon from './account.svg'
import messageIcon from './message-text.svg'

import './chat.css'

const Icon = args => <img {...args} />

const Chat =
    ({ src, group, body, caption, timestamp, preview,
       filename = '', total, groups, senders}) => {
           const isMedia = filename.match(/.(mp4|jpe)/)
           return (
               <div className="msg">
                   <div className="bubble">
                       <div className="txt">
                           <span className="name">+{src}
                               <span> ~ {group} <Icon src={messageIcon}/>{total} <Icon src={userIcon}/>{senders} <Icon src={groupIcon}/>{groups}</span>
                           </span>
                           <span className="timestamp">{timestamp}</span>
                           <p className="message">{caption ? caption : body}</p>
                       </div>
                       <div className="bubble-arrow"></div>
                   </div>
                   {isMedia && (
                        <div className="bubble">
                            <a className="media" href={`/wppmon/${filename}`}>
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
