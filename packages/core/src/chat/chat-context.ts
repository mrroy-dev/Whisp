import Whisp from "../agent";
import { WhispDialogueConfig } from "../types";

export class ChatContext {
  protected chatId: string;
  protected config: WhispDialogueConfig;
  protected whispMap: Map<string, Whisp>;
  protected globalVariables: Map<string, any>;

  constructor(chatId: string, config: WhispDialogueConfig) {
    this.chatId = chatId;
    this.config = config;
    this.whispMap = new Map<string, Whisp>();
    this.globalVariables = new Map<string, any>();
  }

  public getChatId(): string {
    return this.chatId;
  }
  public getConfig(): WhispDialogueConfig {
    return this.config;
  }
  public addWhisp(taskId: string, whisp: Whisp): void {
    this.whispMap.set(taskId, whisp);
  }
  public getWhisp(taskId: string): Whisp | undefined {
    return this.whispMap.get(taskId);
  }
  public getGlobalVariables(): Map<string, any> {
    return this.globalVariables;
  }
}
