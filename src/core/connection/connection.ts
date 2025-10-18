/**
 * Connection - Classe abstrata base para conexões com serviços do jogo
 * Aplica princípios SOLID:
 * - Single Responsibility: Cada conexão gerencia apenas seu serviço
 * - Open/Closed: Aberta para extensão, fechada para modificação
 * - Dependency Inversion: Classes concretas dependem da abstração
 */

/**
 * Classe abstrata Connection
 * Define o contrato base para todas as conexões
 * Host é definido aqui e vem da ENV
 */
export abstract class Connection {
  readonly host: string;
  abstract readonly port: number;
  abstract readonly timeout: number;

  constructor() {
    if (!process.env.GAME_SERVER_HOST) {
      throw new Error('GAME_SERVER_HOST environment variable is required');
    }
    this.host = process.env.GAME_SERVER_HOST;
  }
}

