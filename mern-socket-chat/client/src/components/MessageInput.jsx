import { useEffect, useRef, useState } from "react";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'


export default function MessageInput({ onSend, onTyping }) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const typingRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function handleChange(e) {
    const v = e.target.value;
    setText(v);
    if (!typingRef.current) {
      typingRef.current = true;
      onTyping(true);
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      typingRef.current = false;
      onTyping(false);
    }, 1200);
  }

  function submit() {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
    onTyping(false);
  }

  return (
    <div className="card">
      <div className="footer">
        <button className="btn" onClick={()=>setShowEmoji(s => !s)}>😀</button>
        <input className="input" placeholder="Type a message..." value={text} onChange={handleChange} onKeyDown={(e)=> e.key==="Enter" && submit()} />
        <button className="btn primary" onClick={submit}>Send</button>
      </div>
     {showEmoji && (
  <div style={{ marginTop: ".5rem" }}>
    <Picker 
      data={data} 
      onEmojiSelect={(emoji)=> setText(t=> t + emoji.native)} 
    />
  </div>
)}

    </div>
  );
}
