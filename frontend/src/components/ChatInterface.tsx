import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { motion } from "framer-motion";
import { slideIn, fadeIn, fadeStagger } from "../motion";
import { sendChatQuery } from "../app/api/chat.service";
import { addMessage, setLoading, setError } from "../app/api/chat.slice";
import Loader from "../Load";

interface ChatInterfaceProps {
  onBack: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onBack }) => {
  const [question, setQuestion] = useState("");
  const [enableSummarization, setEnableSummarization] = useState(false);
  const dispatch = useDispatch();

  const { sessionId, messages, isLoading } = useSelector(
    (state: RootState) => state.chat
  );

  const handleQuestionSubmit = async () => {
    if (!question.trim() || !sessionId) return;

    const tempQuestion = question.trim();
    setQuestion(""); // Clear input field

    // Add question to messages
    dispatch(addMessage({ type: "question", text: tempQuestion }));
    dispatch(setLoading(true));

    try {
      const result = await sendChatQuery(
        tempQuestion,
        sessionId,
        enableSummarization
      );

      if (result.success) {
        dispatch(addMessage({ type: "answer", text: result.message }));
      } else {
        dispatch(setError(result.message));
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white text-indigo-600">
        <button
          className="text-sm px-4 py-2 border text-indigo-600 font-bold rounded-md shadow-sm hover:bg-gray-200"
          onClick={onBack}
        >
          Back
        </button>
        <h1 className="text-lg font-bold md:block hidden">SmartPDF Chat</h1>
        <label className="toggle-container">
          <span className="toggle-label">Enable Summarization</span>
          <input
            type="checkbox"
            className="toggle-input"
            checked={enableSummarization}
            onChange={() => setEnableSummarization(!enableSummarization)}
          />
          <span className="toggle-switch"></span>
        </label>
      </header>

      {/* Chat Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center h-full text-gray-500"
            variants={slideIn("up", 0)}
            initial="initial"
            animate="animate"
          >
            <motion.img
              src="/ai-chat-bot.png"
              alt="Ask Questions Below"
              className="w-32 h-32 mb-4"
              variants={fadeIn("up", 0)}
            />
            <motion.p className="text-lg text-white" variants={fadeIn("up", 1)}>
              Ask questions below to get started!
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-4"
            variants={fadeStagger}
            initial="initial"
            animate="animate"
          >
            {messages.map((message, index) => (
              <motion.div
                key={`message-${index}`}
                className={`flex ${
                  message.type === "question" ? "justify-end" : "justify-start"
                }`}
                variants={fadeIn(
                  message.type === "question" ? "right" : "left",
                  index
                )}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg shadow-md ${
                    message.type === "question"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {message.text}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                className="flex justify-start"
                variants={fadeIn("left", messages.length)}
              >
                <div className="max-w-xs p-3 rounded-lg shadow-md bg-gray-200">
                  <Loader />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t flex items-center">
        <textarea
          className="flex-grow p-3 border rounded-md resize-none text-black focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={1}
          placeholder="Type your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          className={`ml-3 px-4 py-2 font-bold rounded-md shadow ${
            question.trim()
              ? "bg-indigo-500 text-white hover:bg-indigo-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          onClick={handleQuestionSubmit}
          disabled={!question.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
