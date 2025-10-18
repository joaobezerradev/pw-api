import { Connection } from './connection';

/**
 * GProviderConnection - Conexão com o serviço GProvider
 * Responsável por broadcasts, chat e comunicação em tempo real
 * Porta e timeout vêm das ENVs
 */
export class GProviderConnection extends Connection {
  readonly port: number;
  readonly timeout: number;

  constructor() {
    super();
    
    if (!process.env.GPROVIDER_PORT) {
      throw new Error('GPROVIDER_PORT environment variable is required');
    }
    if (!process.env.GPROVIDER_TIMEOUT) {
      throw new Error('GPROVIDER_TIMEOUT environment variable is required');
    }

    this.port = parseInt(process.env.GPROVIDER_PORT);
    this.timeout = parseInt(process.env.GPROVIDER_TIMEOUT);
  }
}

