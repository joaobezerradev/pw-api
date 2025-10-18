import { Connection } from './connection';

/**
 * GDeliveryConnection - Conexão com o serviço GDelivery
 * Responsável por entrega de mensagens, mails e gerenciamento GM
 * Porta e timeout vêm das ENVs
 */
export class GDeliveryConnection extends Connection {
  readonly port: number;
  readonly timeout: number;

  constructor() {
    super();
    
    if (!process.env.GDELIVERY_PORT) {
      throw new Error('GDELIVERY_PORT environment variable is required');
    }
    if (!process.env.GDELIVERY_TIMEOUT) {
      throw new Error('GDELIVERY_TIMEOUT environment variable is required');
    }

    this.port = parseInt(process.env.GDELIVERY_PORT);
    this.timeout = parseInt(process.env.GDELIVERY_TIMEOUT);
  }
}

