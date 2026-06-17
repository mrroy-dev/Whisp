import React, { useRef, useCallback } from "react";
import {
  SendOutlined,
  StopOutlined,
  FileOutlined,
  DeleteOutlined,
  PaperClipOutlined,
  PlusOutlined
} from "@ant-design/icons";
import type { UploadedFile } from "../types";
import { Button, Space, Image, Typography } from "antd";
import { WebpageMentionInput } from "./WebpageMentionInput";

const { Text } = Typography;

interface ChatInputProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (fileId: string) => void;
  uploadedFiles: UploadedFile[];
  sending: boolean;
  currentMessageId: string | null;
  onNewSession: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  onInputChange,
  onSend,
  onStop,
  onFileSelect,
  onRemoveFile,
  uploadedFiles,
  sending,
  currentMessageId,
  onNewSession
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEmpty = !inputValue.trim() && uploadedFiles.length === 0;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (!isEmpty && !sending && currentMessageId === null) {
          onSend();
        }
      }
    },
    [isEmpty, sending, currentMessageId, onSend]
  );

  return (
    <div className="px-3 py-2.5" onKeyDown={handleKeyDown}>
      {uploadedFiles.length > 0 && (
        <div className="mb-2">
          <Space wrap size={4}>
            {uploadedFiles.map((file) => {
              const isImage = file.mimeType.startsWith("image/");
              return (
                <div
                  key={file.id}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg"
                  style={{
                    backgroundColor: "var(--chrome-input-background)",
                    border: "1px solid var(--chrome-input-border)"
                  }}
                >
                  {isImage ? (
                    <Image
                      src={
                        file.url
                          ? file.url
                          : `data:${file.mimeType};base64,${file.base64Data}`
                      }
                      alt={file.filename}
                      className="w-8 h-8 object-cover rounded"
                      preview={false}
                    />
                  ) : (
                    <FileOutlined style={{ opacity: 0.5, fontSize: 14 }} />
                  )}
                  <Text className="text-xs max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap" style={{ opacity: 0.7 }}>
                    {file.filename}
                  </Text>
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => onRemoveFile(file.id)}
                    className="p-0 w-4 h-4"
                  />
                </div>
              );
            })}
          </Space>
        </div>
      )}

      <div
        className="chat-input-box relative"
        style={{ borderWidth: "1px", borderStyle: "solid", overflow: "hidden" }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.docx,.xlsx,.txt,.md,.json"
          onChange={onFileSelect}
          className="hidden"
        />

        <div className="px-4 pt-2.5 pb-11">
          <WebpageMentionInput
            value={inputValue}
            onChange={onInputChange}
            disabled={sending || currentMessageId !== null}
            onSend={onSend}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2.5 py-1.5">
          <Button
            type="text"
            size="small"
            icon={<PaperClipOutlined />}
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || currentMessageId !== null}
            style={{ opacity: 0.45 }}
          />

          {currentMessageId ? (
            <Button
              type="text"
              size="small"
              danger
              icon={<StopOutlined className="stop-pulse" style={{ color: "#ef4444" }} />}
              onClick={onStop}
            />
          ) : isEmpty ? (
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={onNewSession}
              disabled={sending}
              style={{ opacity: 0.45 }}
            />
          ) : (
            <Button
              type="text"
              size="small"
              icon={<SendOutlined className="send-btn-enabled" />}
              onClick={onSend}
              loading={sending}
              disabled={sending}
            />
          )}
        </div>
      </div>
      <div className="text-center mt-1" style={{ fontSize: 11, opacity: 0.3 }}>
        Ctrl+Enter to send
      </div>
    </div>
  );
};
