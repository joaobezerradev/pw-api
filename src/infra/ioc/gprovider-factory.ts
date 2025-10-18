import { GProviderConnection } from '@infra/connections';
import { ChatBroadcast } from '@infra/clients/gprovider';

/**
 * Factory estática para actions do GProvider
 * 
 * @example
 * ```typescript
 * const chatBroadcast = GProviderFactory.makeChatBroadcast();
 * await chatBroadcast.sendWorld({ message: 'Olá!' });
 * ```
 */
export class GProviderFactory {
  static makeChatBroadcast(): ChatBroadcast {
    return new ChatBroadcast(new GProviderConnection());
  }
}
