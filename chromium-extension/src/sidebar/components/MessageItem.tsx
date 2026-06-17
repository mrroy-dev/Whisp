import React, { useMemo, useCallback } from "react";
import { TextItem } from "./TextItem";
import type { ChatMessage } from "../types";
import { ThinkingItem } from "./ThinkingItem";
import { ToolCallItem } from "./ToolCallItem";
import { WorkflowCard } from "./WorkflowCard";
import { MarkdownRenderer } from "../MarkdownRenderer";
import { AgentExecutionCard } from "./AgentExecutionCard";
import { Typography, Image, Spin, Tooltip } from "antd";
import {
  RobotOutlined,
  UserOutlined,
  FileOutlined,
  ExclamationCircleOutlined,
  CopyOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { message as AntdMessage } from "antd";

const { Text } = Typography;

const decodeHtmlEntities = (text: string) => {
  if (!text) return "";
  if (typeof window === "undefined") {
    return text
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
};

const renderContentWithWebRefs = (
  content: string,
  onWebRefClick: (url: string) => void
) => {
  if (!content) return null;
  const elements: React.ReactNode[] = [];
  const regex =
    /<span class="webpage-reference"[^>]*tab-id="([^"]+)"[^>]*url="([^"]+)"[^>]*>(.*?)<\/span>/gi;
  let lastIndex = 0;
  let keyIndex = 0;

  const pushText = (text: string) => {
    if (!text) return;
    const normalized = text.replace(/<br\s*\/?>/gi, "\n");
    const decoded = decodeHtmlEntities(normalized);
    if (!decoded) return;
    const parts = decoded.split(/(\n)/);
    parts.forEach((part) => {
      if (!part) {
        return;
      }
      if (part === "\n") {
        elements.push(<br key={`br-${keyIndex++}`} />);
      } else {
        elements.push(
          <React.Fragment key={`text-${keyIndex++}`}>{part}</React.Fragment>
        );
      }
    });
  };

  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const [fullMatch, tabId, url, title] = match;
    if (match.index > lastIndex) {
      pushText(content.slice(lastIndex, match.index));
    }

    const decodedTitle = decodeHtmlEntities(title);
    const decodedUrl = decodeHtmlEntities(url);
    elements.push(
      <span
        key={`webref-${tabId || keyIndex}`}
        className="webpage-reference-display user-webpage-reference"
        onClick={() => onWebRefClick(decodedUrl)}
      >
        {`${decodedTitle}`}
      </span>
    );
    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < content.length) {
    pushText(content.slice(lastIndex));
  }

  if (elements.length === 0) {
    return decodeHtmlEntities(content);
  }

  return elements;
};

interface MessageItemProps {
  message: ChatMessage;
  onUpdateMessage?: (status?: "stop") => void;
  onRegenerate?: () => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onUpdateMessage,
  onRegenerate
}) => {
  const handleWebRefClick = (url: string) => {
    if (!url) return;
    if (typeof chrome !== "undefined" && chrome.tabs?.create) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, "_blank", "noopener");
    }
  };

  const userContent = useMemo(
    () => renderContentWithWebRefs(message.content || "", handleWebRefClick),
    [message.content]
  );

  const getMessageText = useCallback(() => {
    if (message.contentItems && message.contentItems.length > 0) {
      return message.contentItems
        .filter((item) => item.type === "text")
        .map((item) => item.text)
        .join("\n");
    }
    return message.content || "";
  }, [message]);

  const handleCopy = useCallback(async () => {
    const text = getMessageText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      AntdMessage.success("Copied");
    } catch {
      AntdMessage.error("Copy failed");
    }
  }, [getMessageText]);

  if (message.role === "user") {
    return (
      <div className="flex justify-end mb-3 message-actions-group">
        <div className="max-w-[85%]">
          <div className="user-bubble">
            {message.content && (
              <div style={{ color: "var(--user-bubble-text)" }}>
                {userContent}
              </div>
            )}
            {message.status == "waiting" && (
              <span className="inline-flex items-center gap-1 ml-1" style={{ color: "var(--user-bubble-text)" }}>
                <span className="typing-dot">.</span>
                <span className="typing-dot">.</span>
                <span className="typing-dot">.</span>
              </span>
            )}
          </div>
          {message.uploadedFiles && message.uploadedFiles.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5 justify-end">
              {message.uploadedFiles.map((file) => {
                const isImage = file.mimeType.startsWith("image/");
                return (
                  <div key={file.id} className="inline-block">
                    {isImage ? (
                      <Image
                        src={
                          file.url
                            ? file.url
                            : `data:${file.mimeType};base64,${file.base64Data}`
                        }
                        alt={file.filename}
                        className="max-w-[180px] max-h-[180px] rounded-lg"
                        style={{ border: "1px solid var(--chrome-input-border)" }}
                        preview={false}
                      />
                    ) : (
                      <div
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                        style={{
                          backgroundColor: "var(--chrome-input-background)",
                          border: "1px solid var(--chrome-input-border)"
                        }}
                      >
                        <FileOutlined style={{ opacity: 0.5 }} />
                        <Text className="text-xs" style={{ opacity: 0.8 }}>
                          {file.filename}
                        </Text>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 mb-3 message-actions-group">
      <div className="flex-shrink-0 mt-1">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--chrome-input-background)" }}
        >
          <RobotOutlined style={{ fontSize: 14, opacity: 0.5 }} />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="ai-bubble">
          {message.contentItems && message.contentItems.length > 0 ? (
            message.contentItems.map((item, index) => {
              if (item.type === "thinking" && item.text != "[REDACTED]") {
                return (
                  <div key={`chat-thinking-${item.streamId}-${index}`}>
                    <ThinkingItem
                      streamId={item.streamId}
                      text={item.text}
                      streamDone={item.streamDone}
                    />
                  </div>
                );
              } else if (item.type === "text") {
                return (
                  <div key={`chat-text-${item.streamId}-${index}`}>
                    <TextItem
                      streamId={item.streamId}
                      text={item.text}
                      streamDone={item.streamDone}
                    />
                  </div>
                );
              } else if (item.type === "tool") {
                return (
                  <div
                    key={`chat-tool-${item.toolCallId}-${index}`}
                    className="mb-2"
                  >
                    <ToolCallItem item={item} />
                  </div>
                );
              } else if (item.type === "file") {
                return (
                  <Image
                    key={`chat-file-${index}`}
                    src={
                      item.data.startsWith("http")
                        ? item.data
                        : `data:${item.mimeType};base64,${item.data}`
                    }
                    alt="Message file"
                    className="max-w-full my-1.5 rounded-lg"
                    style={{ border: "1px solid var(--chrome-input-border)" }}
                  />
                );
              } else if (
                item.type === "task" &&
                (item.task.workflow || item.task.agents?.length > 0)
              ) {
                return (
                  <div key={`chat-task-${item.taskId}-${index}`} className="mb-2">
                    {item.task.workflow ? (
                      <WorkflowCard
                        task={item.task}
                        onUpdateTask={onUpdateMessage}
                      />
                    ) : (
                      <AgentExecutionCard
                        agentNode={item.task.agents[0].agentNode}
                        task={item.task}
                      />
                    )}
                  </div>
                );
              }
              return null;
            })
          ) : message.content ? (
            <div className="mb-0.5">
              <MarkdownRenderer content={message.content} />
            </div>
          ) : message.status == "waiting" ? (
            <span className="inline-flex items-center gap-1">
              <span className="typing-dot">.</span>
              <span className="typing-dot">.</span>
              <span className="typing-dot">.</span>
            </span>
          ) : (
            <></>
          )}
          {message.error && (
            <div className="mt-1.5 flex items-start gap-1.5 text-sm" style={{ color: "#ef4444" }}>
              <ExclamationCircleOutlined className="mt-0.5" />
              <span>{String(message.error)}</span>
            </div>
          )}
        </div>
        {message.status !== "waiting" && !message.error && (
          <div className="flex items-center gap-1.5 mt-1 ml-1 message-actions">
            <Tooltip title="Copy">
              <CopyOutlined
                className="message-action-btn"
                onClick={handleCopy}
              />
            </Tooltip>
            {onRegenerate && (
              <Tooltip title="Regenerate">
                <ReloadOutlined
                  className="message-action-btn"
                  onClick={onRegenerate}
                />
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
