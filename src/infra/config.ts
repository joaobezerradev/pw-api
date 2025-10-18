/**
 * Configura�0�4�0�1es do servidor do jogo
 */

export const GameServerConfig = {
  // Endere�0�4o do servidor
  HOST: '127.0.0.1',
  
  // Portas dos servi�0�4os
  PORTS: {
    GAMEDBD: 29400,      // Game Database Server
    GDELIVERYD: 29100,   // Delivery Server
    GPROVIDER: 29300,    // Provider Server
  },
  
  // Timeouts (em milissegundos)
  TIMEOUTS: {
    CONNECTION: 10000,   // 10 segundos para conectar
    RPC_DEFAULT: 30000,  // 30 segundos para RPC
    RPC_SHORT: 5000,     // 5 segundos para opera�0�4�0�1es r��pidas
  }
};

/**
 * Retorna a configura�0�4�0�0o para um servi�0�4o espec��fico
 */
export function getServerConfig(service: 'GAMEDBD' | 'GDELIVERYD' | 'GPROVIDER') {
  return {
    host: GameServerConfig.HOST,
    port: GameServerConfig.PORTS[service]
  };
}

