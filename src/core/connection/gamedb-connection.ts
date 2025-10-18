import { Connection } from './connection';

/**
 * GameDBConnection - Conexão com o serviço GameDB
 * Responsável por operações de banco de dados do jogo
 * Porta e timeout vêm das ENVs
 */
export class GameDBConnection extends Connection {
  readonly port: number;
  readonly timeout: number;

  constructor() {
    super();
    
    if (!process.env.GAMEDB_PORT) {
      throw new Error('GAMEDB_PORT environment variable is required');
    }
    if (!process.env.GAMEDB_TIMEOUT) {
      throw new Error('GAMEDB_TIMEOUT environment variable is required');
    }

    this.port = parseInt(process.env.GAMEDB_PORT);
    this.timeout = parseInt(process.env.GAMEDB_TIMEOUT);
  }
}

