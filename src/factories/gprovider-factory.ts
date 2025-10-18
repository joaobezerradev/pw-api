import { GProviderConnection } from '../core';
import { ChatBroadcast } from '../actions/gprovider';

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
