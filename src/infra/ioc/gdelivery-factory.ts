import { GDeliveryConnection } from '@infra/connections';
import {
  SendMail,
  GMBanRole,
  GMMuteRole,
  GMListOnlineUser,
} from '@infra/clients/gdelivery';

/**
 * Factory estática para actions do GDelivery
 * 
 * @example
 * ```typescript
 * const sendMail = GDeliveryFactory.makeSendMail();
 * const result = await sendMail.execute({...});
 * ```
 */
export class GDeliveryFactory {
  static makeSendMail(): SendMail {
    return new SendMail(new GDeliveryConnection());
  }

  static makeGMBanRole(): GMBanRole {
    return new GMBanRole(new GDeliveryConnection());
  }

  static makeGMMuteRole(): GMMuteRole {
    return new GMMuteRole(new GDeliveryConnection());
  }

  static makeGMListOnlineUser(input: GMListOnlineUser.Input): GMListOnlineUser {
    return new GMListOnlineUser(new GDeliveryConnection(), input);
  }
}
