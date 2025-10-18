/**
 * Exemplo de uso das classes Connection com Inversão de Dependência
 * 
 * Este exemplo demonstra como usar as conexões de forma desacoplada,
 * seguindo os princípios SOLID.
 * 
 * As conexões pegam host, porta e timeout das variáveis de ambiente:
 * - GAME_SERVER_HOST (compartilhado)
 * - GAMEDB_PORT, GAMEDB_TIMEOUT
 * - GDELIVERY_PORT, GDELIVERY_TIMEOUT
 * - GPROVIDER_PORT, GPROVIDER_TIMEOUT
 */

import {
  GameDBConnection,
  GDeliveryConnection,
  GProviderConnection,
  GetRoleBase,
  ChatBroadcast,
  GMListOnlineUser,
} from '../src';

/**
 * Exemplo 1: Criar conexões (valores vêm das ENVs)
 */
async function exemploConexoesDasEnvs() {
  // Cria as 3 conexões - valores vêm automaticamente das ENVs
  const gamedb = new GameDBConnection();
  const gdelivery = new GDeliveryConnection();
  const gprovider = new GProviderConnection();

  console.log('=== Conexões Criadas (das ENVs) ===');
  console.log(`GameDB: ${gamedb.host}:${gamedb.port} (timeout: ${gamedb.timeout}ms)`);
  console.log(`GDelivery: ${gdelivery.host}:${gdelivery.port} (timeout: ${gdelivery.timeout}ms)`);
  console.log(`GProvider: ${gprovider.host}:${gprovider.port} (timeout: ${gprovider.timeout}ms)`);
}

/**
 * Exemplo 2: Customizar ENVs em runtime
 */
async function exemploCustomizandoEnvs() {
  // Define ENVs customizadas
  process.env.GAME_SERVER_HOST = '192.168.1.100';
  process.env.GAMEDB_PORT = '30400';
  process.env.GAMEDB_TIMEOUT = '30000';

  const gamedb = new GameDBConnection();

  console.log('=== Conexão Customizada (ENVs em runtime) ===');
  console.log(`GameDB: ${gamedb.host}:${gamedb.port} (timeout: ${gamedb.timeout}ms)`);
  
  // Volta para os valores padrão
  delete process.env.GAME_SERVER_HOST;
  delete process.env.GAMEDB_PORT;
  delete process.env.GAMEDB_TIMEOUT;
}

/**
 * Exemplo 3: Usar conexões com os protocolos (Inversão de Dependência)
 */
async function exemploUsandoProtocolos() {
  // Cria a conexão (valores vêm das ENVs)
  const gamedb = new GameDBConnection();

  try {
    // Usa a conexão com o protocolo - DI aplicada!
    const result = await GetRoleBase.execute(gamedb, { roleId: 1073 });

    if (result.retcode === 0 && result.base) {
      console.log('=== Role Base Obtida ===');
      console.log(`Nome: ${result.base.name}`);
      console.log(`Nível: ${result.base.level}`);
      console.log(`Classe: ${result.base.cls}`);
    }
  } catch (error) {
    console.error('Erro ao buscar role:', error);
  }
}

/**
 * Exemplo 4: Classe de serviço usando DI (Dependency Injection)
 */
class PlayerService {
  constructor(
    private readonly gamedb: GameDBConnection,
    private readonly gdelivery: GDeliveryConnection,
    private readonly gprovider: GProviderConnection
  ) {}

  async getPlayerInfo(roleId: number) {
    return GetRoleBase.execute(this.gamedb, { roleId });
  }

  async listOnlinePlayers(gmRoleId: number) {
    return GMListOnlineUser.executeAll(this.gdelivery, { gmRoleId });
  }

  async sendSystemMessage(message: string) {
    return ChatBroadcast.sendSystem(this.gprovider, { message });
  }
}

/**
 * Exemplo 5: Usar o serviço com DI
 */
async function exemploComDependencyInjection() {
  // Cria as conexões
  const gamedb = new GameDBConnection('127.0.0.1');
  const gdelivery = new GDeliveryConnection('127.0.0.1');
  const gprovider = new GProviderConnection('127.0.0.1');

  // Injeta as dependências no serviço
  const playerService = new PlayerService(gamedb, gdelivery, gprovider);

  try {
    // Usa o serviço
    const player = await playerService.getPlayerInfo(1073);
    console.log('=== Player Info (via DI) ===');
    console.log(`Nome: ${player.name}`);
    console.log(`Nível: ${player.level}`);

    // Envia mensagem do sistema
    await playerService.sendSystemMessage('Servidor em manutenção em 10 minutos!');
    console.log('✓ Mensagem enviada!');
  } catch (error) {
    console.error('Erro:', error);
  }
}

/**
 * Executa os exemplos
 */
async function main() {
  console.log('\n🎮 EXEMPLOS DE USO - Connection Classes\n');

  await exemploConexoesPadrao();
  console.log('\n');

  await exemploConexoesCustomizadas();
  console.log('\n');

  // Descomente para testar com servidor real:
  // await exemploUsandoProtocolos();
  // await exemploComDependencyInjection();
}

// Executar se for o arquivo principal
if (require.main === module) {
  main().catch(console.error);
}

