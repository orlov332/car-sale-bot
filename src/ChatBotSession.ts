import OpenAI from 'openai';
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionCreateParamsBase,
  ChatCompletionMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from 'openai/src/resources/chat/completions';

type SystemMessage = ChatCompletionSystemMessageParam;
type AssistantMessage = ChatCompletionAssistantMessageParam;
type UserMessage = ChatCompletionUserMessageParam;
type ContextMessage = UserMessage | AssistantMessage;
type ModelName = ChatCompletionCreateParamsBase['model'];
type Message = ChatCompletionMessageParam;

export class ChatBotSession {
  private readonly openai = new OpenAI();
  private readonly systemMessages: SystemMessage[];
  private sessionContext: ContextMessage[] = [];

  constructor(
    systemMessages: string[] = [],
    public readonly temperature: number = 1,
    public readonly model: ModelName = 'gpt-3.5-turbo',
  ) {
    this.systemMessages = systemMessages.map((message) => ({
      role: 'system',
      content: message,
    }));
  }

  sendMessage = async (message: string) => {
    const userMessage: UserMessage = { role: 'user', content: message };
    const assistantMessage = await this.send(userMessage, 'text');
    this.sessionContext.push(userMessage, assistantMessage);
    return assistantMessage.content;
  };

  sendSystemMessage = async (message: string, responseType: 'text' | 'json_object' = 'text', temperature?: number) => {
    const response = await this.send({ role: 'system', content: message }, responseType, temperature);
    return response.content;
  };

  // sendFunctionMessage = async (message: string, responseType: 'text' | 'json_object' = 'text') => {
  //   const response = await this.send({ role: 'function', content: message }, responseType);
  //   return response.content;
  // };

  private send = async (message: Message, responseType: 'text' | 'json_object', temperature?: number) => {
    const completion = await this.openai.chat.completions.create({
      messages: [...this.systemMessages, ...this.sessionContext, message],
      model: this.model,
      temperature: temperature ?? this.temperature,
      response_format: {
        type: responseType,
      },
    });
    return completion.choices[0].message;
  };
}
