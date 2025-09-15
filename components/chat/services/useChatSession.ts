import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const SESSION_KEY = "active_chat_session";

// sessionId = `${pdfId}#${uuidv4()}#${subject}`

const useChatSession = (pdfId, subject) => {
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    if (!pdfId || !subject) return; // ✅ Wait until both are ready

    const storedSession = localStorage.getItem(SESSION_KEY);

    if (storedSession && storedSession.startsWith(`${pdfId}#`) && storedSession.endsWith(`#${subject}`)) {
      // ✅ Reuse session if it matches pdfId AND subject
      setSessionId(storedSession);
    } else {
      // ✅ Create new session if no match
      createNewSession();
    }
  }, [pdfId, subject]);

  const createNewSession = () => {
    const newSessionId = `${pdfId}#${uuidv4()}#${subject}`;
    localStorage.setItem(SESSION_KEY, newSessionId);
    setSessionId(newSessionId);
  };

  return { sessionId, startNewSession: createNewSession };
};

export default useChatSession;
