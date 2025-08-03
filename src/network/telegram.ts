import { TelegramNetworkObjectType } from "@/types/telegram";
import Logger from "@/utils/logger";
import axios from "axios";
import { AxiosError } from "axios";

function escapeMarkdownV2(text: string): string {
  return text.replace(/([_\*\[\]\(\)~`>#+\-=|{}.!\\])/g, "\\$1");
}

export class TelegramNetwork {
  private token: string;
  private chat_id: string;
  private obj: TelegramNetworkObjectType;
  private logger?: boolean;

  constructor(
    token: string,
    chat_id: string,
    obj: TelegramNetworkObjectType,
    logger?: boolean
  ) {
    if (!token || !chat_id) throw new Error("Missing token or chat_id");

    this.token = token;
    this.chat_id = chat_id;
    this.obj = obj;
    this.logger = logger;
  }

  private get request() {
    return axios.create({
      baseURL: `https://api.telegram.org/bot${this.token}`,
    });
  }

  private methods = {
    send_message: "/sendMessage",
  };

  sendMessage = async () => {
    try {
      await this.request.post(this.methods.send_message, {
        chat_id: this.chat_id,
        text: escapeMarkdownV2(
          `**[Server Side Error]:**\n\ncode:${this.obj.status_code}\nmethod:${
            this.obj.method
          }\nmessage:${this.obj.message}\nrequest url: ${
            this.obj.originalUrl
          }\n\nTime: ${new Date().toISOString()}`
        ),
        parse_mode: "MarkdownV2",
      });

      if (this.logger) {
        Logger("[Success Log]: Telegram Message Send", "log");
      }
    } catch (error) {
      if (this.logger) {
        if (error instanceof AxiosError) {
          Logger(
            `[Error Log]: Error to send Telegram Message\n\nStatus: ${error.response?.status}\nData Error: ${error.response?.data}`,
            "error"
          );
        } else {
          Logger(
            `[Error Log]: Error to send Telegram Message\n\nUnknown Error: ${
              (error as Error).message
            }`,
            "error"
          );
        }
      }
    }
  };
}
