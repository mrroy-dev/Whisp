import {
  JSONSchema7,
  SharedV2ProviderOptions,
  LanguageModelV2ToolCallPart
} from "@ai-sdk/provider";
import { ToolResult } from "./tools.types";
import { LLMStreamMessage } from "./llm.types";
import {
  WhispConfig,
  HumanCallback,
  AgentStreamCallback
} from "./agent.types";

export type MessageTextPart = {
  type: "text";
  text: string;
};

export type MessageFilePart = {
  type: "file";
  fileId: string;
  filename?: string;
  mimeType: string;
  data: string; // base64 / URL
  filePath?: string;
};

export type ToolCallPart = {
  type: "tool-call";
  toolCallId: string;
  toolName: string;
  input: Record<string, any>;
};

export type ToolResultPart = {
  type: "tool-result";
  toolCallId: string;
  toolName: string;
  isError: boolean;
  output: string | Record<string, any>;
};

export type ChatStreamMessage = {
  streamType: "chat";
  chatId: string;
  messageId: string;
} & (
  | {
      type: "chat_start";
    }
  | LLMStreamMessage
  | {
      type: "chat_end";
      error: string | null;
      duration: number;
      reactLoopNum: number;
    }
);

export interface ChatStreamCallback {
  chatCallback: {
    onMessage: (message: ChatStreamMessage) => Promise<void>;
  };
  taskCallback?: AgentStreamCallback & HumanCallback;
}

export type WhispMessage = { id: string } & (
  | {
      role: "user";
      content: WhispMessageUserPart[];
    }
  | {
      role: "assistant";
      content: WhispMessageAssistantPart[];
    }
  | {
      role: "tool";
      content: WhispMessageToolPart[];
    }
) & {
    timestamp: number;
    extra?: Record<string, any>;
  };

export type WhispMessageUserPart =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "file";
      mimeType: string;
      data: string; // base64 / URL
      filename?: string;
    };

export type WhispMessageAssistantPart =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "reasoning";
      text: string;
      providerOptions?: SharedV2ProviderOptions;
    }
  | {
      type: "tool-call";
      toolCallId: string;
      toolName: string;
      args: Record<string, unknown>;
      providerOptions?: SharedV2ProviderOptions;
    };

export type WhispMessageToolPart = {
  type: "tool-result";
  toolCallId: string;
  toolName: string;
  result: string | Record<string, unknown>;
};

export interface DialogueTool {
  readonly name: string;
  readonly description?: string;
  readonly parameters: JSONSchema7;
  execute: (
    args: Record<string, unknown>,
    toolCall: LanguageModelV2ToolCallPart,
    messageId: string
  ) => Promise<ToolResult>;
}

export type WhispDialogueConfig = Omit<WhispConfig, "callback"> & {
  chatLlms?: string[];
};

export type DialogueParams = {
  messageId: string;
  user: Array<MessageTextPart | MessageFilePart>;
  callback: ChatStreamCallback;
  datetime?: string;
  signal?: AbortSignal;
  extra?: Record<string, any>;
};
