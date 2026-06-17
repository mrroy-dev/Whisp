import "./index.css";
import { uuidv4 } from "@whisp-ai/core";
import { createRoot } from "react-dom/client";
import { ChatInput } from "./components/ChatInput";
import { SessionHistory } from "./components/SessionHistory";
import { useFileUpload } from "./hooks/useFileUpload";
import { MessageItem } from "./components/MessageItem";
import type { ChatMessage, UploadedFile } from "./types";
import { useChatCallbacks } from "./hooks/useChatCallbacks";
import { useSessionManagement } from "./hooks/useSessionManagement";
import { ThemeProvider } from "./providers/ThemeProvider";
import { message as AntdMessage, Button, Space } from "antd";
import { HistoryOutlined, SettingOutlined } from "@ant-design/icons";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

const AppRun = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [modelName, setModelName] = useState("");
  const [usage, setUsage] = useState({ promptTokens: 0, completionTokens: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const lastMessageCountRef = useRef(0);
  const scrollRafRef = useRef<number | null>(null);

  const {
    chatId,
    showSessionHistory,
    setShowSessionHistory,
    handleNewSession: newSession,
    handleShowSessionHistory,
    handleSelectSession: selectSession
  } = useSessionManagement();

  const forceUpdate = useCallback(
    (status?: "stop") => {
      if (status === "stop") {
        setCurrentMessageId(null);
      }
      setUpdateTrigger((prev) => prev + 1);
    },
    [setCurrentMessageId]
  );

  const { handleChatCallback, handleTaskCallback } = useChatCallbacks(
    setMessages,
    currentMessageId,
    setCurrentMessageId
  );
  const { fileToBase64, uploadFile } = useFileUpload();

  const isNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || container.scrollHeight <= container.clientHeight * 1.6) {
      return true;
    }
    const threshold = container.clientHeight / 3;
    const scrollBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    return scrollBottom < threshold;
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setAutoScroll(isNearBottom());
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [isNearBottom]);

  useEffect(() => {
    if (!autoScroll) return;
    const messageCount = messages.length;
    const isNewMessage = messageCount !== lastMessageCountRef.current;
    lastMessageCountRef.current = messageCount;

    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current);
    }

    scrollRafRef.current = requestAnimationFrame(() => {
      if (!autoScroll) return;
      if (isNewMessage) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      const container = messagesContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });

    return () => {
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = null;
      }
    };
  }, [messages, autoScroll]);

  // Load LLM config from storage
  useEffect(() => {
    chrome.storage.sync.get("llmConfig", (result) => {
      if (result.llmConfig?.model) {
        setModelName(result.llmConfig.model);
      }
    });
  }, []);

  // Listen to background messages
  useEffect(() => {
    const handleMessage = (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      if (message.type === "chat_callback") {
        handleChatCallback(message.data);
      } else if (message.type === "task_callback") {
        handleTaskCallback(message.data);
      } else if (message.type === "chat_result") {
        const messageId = message.data.messageId;
        const error = message.data.error;
        const resultUsage = message.data.result?.usage;
        if (resultUsage) {
          setUsage((prev) => ({
            promptTokens: prev.promptTokens + (resultUsage.promptTokens || 0),
            completionTokens:
              prev.completionTokens + (resultUsage.completionTokens || 0)
          }));
        }
        if (error && messageId === currentMessageId) {
          setCurrentMessageId(null);
          const userMessage = messages.find((m) => m.id === messageId);
          if (userMessage) {
            userMessage.status = "error";
          }
        }
      } else if (message.type === "log") {
        const level = message.data.level;
        const msg = message.data.message;
        const showMessage =
          level === "error"
            ? AntdMessage.error
            : level === "success"
            ? AntdMessage.success
            : AntdMessage.info;
        showMessage({
          content: msg,
          className: "toast-text-black"
        });
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [handleChatCallback, handleTaskCallback, currentMessageId]);

  // Send message
  const sendMessage = useCallback(async () => {
    if ((!inputValue.trim() && uploadedFiles.length === 0) || sending) return;

    const messageId = uuidv4();

    // Upload files
    const fileParts: Array<{
      type: "file";
      fileId: string;
      filename?: string;
      mimeType: string;
      data: string;
    }> = [];
    for (const file of uploadedFiles) {
      try {
        const { fileId, url } = await uploadFile(file);
        file.fileId = fileId;
        file.url = url;
        fileParts.push({
          type: "file",
          fileId,
          filename: file.filename,
          mimeType: file.mimeType,
          data: url.startsWith("http") ? url : file.base64Data
        });
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    // Build user message content
    const userParts: Array<
      | { type: "text"; text: string }
      | {
          type: "file";
          fileId: string;
          filename?: string;
          mimeType: string;
          data: string;
        }
    > = [];
    if (inputValue.trim()) {
      userParts.push({ type: "text", text: inputValue });
    }
    userParts.push(...fileParts);

    const userMessage: ChatMessage = {
      id: messageId,
      role: "user",
      content: inputValue,
      timestamp: Date.now(),
      contentItems: [],
      uploadedFiles: [...uploadedFiles],
      status: "waiting"
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setUploadedFiles([]);
    setSending(true);
    setCurrentMessageId(messageId);

    try {
      chrome.runtime.sendMessage({
        requestId: uuidv4(),
        type: "chat",
        data: {
          user: userParts,
          messageId: messageId,
          chatId: chatId,
          windowId: (await chrome.windows.getCurrent()).id
        }
      });
    } catch (error) {
      userMessage.status = "error";
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  }, [inputValue, uploadedFiles, sending, uploadFile, chatId]);

  // Stop message
  const stopMessage = useCallback((messageId: string) => {
    chrome.runtime.sendMessage({
      type: "stop",
      data: { messageId }
    });
    setCurrentMessageId(null);
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      const newFiles: UploadedFile[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64Data = await fileToBase64(file);
        newFiles.push({
          id: uuidv4(),
          base64Data: base64Data,
          mimeType: file.type,
          filename: file.name
        });
      }
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    },
    [fileToBase64]
  );

  // Remove file
  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const handleStop = useCallback(() => {
    if (currentMessageId) {
      stopMessage(currentMessageId);
    }
  }, [currentMessageId, stopMessage]);

  const handleNewSession = useCallback(() => {
    newSession(setMessages, setCurrentMessageId, messages.length);
  }, [newSession, messages.length]);

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      selectSession(sessionId, setMessages, setCurrentMessageId);
    },
    [selectSession]
  );

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = async (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === "sync" && changes["llmConfig"]) {
        const newConfig = changes["llmConfig"].newValue;
        if (newConfig?.model) {
          setModelName(newConfig.model);
        }
        handleNewSession();
      }
    };
    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [handleNewSession]);

  const handleRegenerate = useCallback(() => {
    const lastAiMessage = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    if (!lastAiMessage) return;
    const lastUserMsg = [...messages]
      .reverse()
      .find((m) => m.role === "user");
    if (lastUserMsg) {
      setInputValue(lastUserMsg.content);
      setMessages((prev) => prev.filter((m) => m.id !== lastAiMessage.id));
    }
  }, [messages]);

  const suggestedActions = useMemo(
    () => [
      { label: "Summarize page", icon: "📄", action: "Summarize the current page" },
      { label: "Draft an email", icon: "✉️", action: "Help me draft an email about" },
      { label: "Explain code", icon: "💻", action: "Explain the following code" },
      { label: "Research topic", icon: "🔍", action: "Research and summarize information about" }
    ],
    []
  );

  const hasTokenUsage = usage.promptTokens > 0 || usage.completionTokens > 0;

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: "var(--chrome-bg-primary)" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{
          borderBottom: "1px solid var(--chrome-input-border)",
          backgroundColor: "var(--chrome-bg-secondary)"
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-sm">Whisp</span>
          {modelName && (
            <span className="model-badge" title={modelName}>
              {modelName}
            </span>
          )}
        </div>
        <Space size={2}>
          <Button type="text" size="small" icon={<HistoryOutlined />} onClick={handleShowSessionHistory} />
          <Button type="text" size="small" icon={<SettingOutlined />} onClick={() => chrome.runtime.openOptionsPage()} />
        </Space>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 relative"
        style={{ backgroundColor: "var(--chrome-bg-primary)" }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6">
            <div
              className="w-28 h-28 mb-5"
              style={{
                maskImage: "url(/icon_light.png)",
                WebkitMaskImage: "url(/icon_light.png)",
                maskSize: "contain",
                WebkitMaskSize: "contain",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskPosition: "center",
                WebkitMaskPosition: "center",
                backgroundColor: "var(--chrome-icon-color)",
                opacity: 0.1
              }}
            />
            <p className="text-sm mb-4 text-center" style={{ opacity: 0.4 }}>
              What can I help with?
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-xs">
              {suggestedActions.map((action) => (
                <button
                  key={action.label}
                  className="suggestion-chip"
                  onClick={() => setInputValue(action.action)}
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, idx) => (
            <div key={message.id} className="message-enter">
              <MessageItem
                message={message}
                onUpdateMessage={forceUpdate}
                onRegenerate={
                  message.role === "assistant" &&
                  idx === messages.length - 1 &&
                  !currentMessageId
                    ? handleRegenerate
                    : undefined
                }
              />
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Token usage footer */}
      {hasTokenUsage && (
        <div className="usage-footer">
          {usage.promptTokens} prompt &middot; {usage.completionTokens} completion
        </div>
      )}

      {/* Input */}
      <ChatInput
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSend={sendMessage}
        onStop={handleStop}
        onFileSelect={handleFileSelect}
        onRemoveFile={removeFile}
        uploadedFiles={uploadedFiles}
        sending={sending}
        currentMessageId={currentMessageId}
        onNewSession={handleNewSession}
      />

      {/* Session History */}
      <SessionHistory
        visible={showSessionHistory}
        onClose={() => setShowSessionHistory(false)}
        onSelectSession={handleSelectSession}
        currentSessionId={chatId}
      />
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AppRun />
    </ThemeProvider>
  </React.StrictMode>
);
