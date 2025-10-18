/**
 * Exemplos de uso das Factories
 * 
 * Factories facilitam a criação de actions sem precisar instanciar manualmente
 * as connections. Basta chamar a factory e usar!
 */

import {
  // GameDB
  makeGetRoleBase,
  makeGetRoleStatus,
  makeForbidUser,
  makeRenameRole,
  
  // GDelivery
  makeSendMail,
  makeGMBanRole,
  makeGMMuteRole,
  makeGMListOnlineUser,
  
  // GProvider
  makeChatBroadcast,
} from '../src';

/**
 * Exemplo 1: Buscar dados de um personagem (GameDB)
 */
async function exemploGameDB() {
  // Antes (sem factory):
  // const connection = new GameDBConnection();
  // const getRoleBase = new GetRoleBase(connection);
  // const result = await getRoleBase.execute({ roleId: 1073 });
  
  // Agora (com factory):
  const getRoleBase = makeGetRoleBase();
  const result = await getRoleBase.execute({ roleId: 1073 });
  
  console.log('Role Base:', result.base?.name);
  
  // Cada factory retorna uma nova instância
  const getRoleStatus = makeGetRoleStatus();
  const status = await getRoleStatus.execute({ roleId: 1073 });
  
  console.log('Level:', status.status?.level);
}

/**
 * Exemplo 2: Renomear personagem
 */
async function exemploRenomear() {
  const renameRole = makeRenameRole();
  
  const result = await renameRole.execute({
    roleId: 1073,
    oldName: 'NomeAntigo',
    newName: 'NovoNome',
  });
  
  if (result.retcode === 0) {
    console.log('✅ Personagem renomeado!');
  }
}

/**
 * Exemplo 3: Banir/Desbanir personagem (GDelivery)
 */
async function exemploBan() {
  const gmBanRole = makeGMBanRole();
  
  // Banir
  await gmBanRole.execute({
    roleId: 1073,
    time: 3600, // 1 hora
    reason: 'Violação de regras',
  });
  
  console.log('✅ Personagem banido');
  
  // Desbanir (método helper)
  await gmBanRole.unban({
    roleId: 1073,
    reason: 'Ban removido',
  });
  
  console.log('✅ Ban removido');
}

/**
 * Exemplo 4: Listar jogadores online
 */
async function exemploListarOnline() {
  // GMListOnlineUser precisa de input no construtor
  const gmListOnlineUser = makeGMListOnlineUser({ gmRoleId: 32 });
  
  // Buscar todos os jogadores
  const players = await gmListOnlineUser.executeAll({ gmRoleId: 32 });
  
  console.log(`Total online: ${players.length}`);
  players.forEach(player => {
    console.log(`- ${player.name} (ID: ${player.roleid})`);
  });
}

/**
 * Exemplo 5: Enviar mensagem no chat (GProvider)
 */
async function exemploChat() {
  const chatBroadcast = makeChatBroadcast();
  
  // Mensagem mundial
  await chatBroadcast.sendWorld({
    message: 'Servidor reiniciando em 5 minutos!',
  });
  
  // Mensagem de sistema
  await chatBroadcast.sendSystem({
    message: 'Bem-vindo ao servidor!',
  });
  
  console.log('✅ Mensagens enviadas');
}

/**
 * Exemplo 6: Usar em um serviço/classe
 */
class PlayerService {
  // Factories podem ser chamadas diretamente nos métodos
  
  async getPlayerInfo(roleId: number) {
    const getRoleBase = makeGetRoleBase();
    return getRoleBase.execute({ roleId });
  }
  
  async banPlayer(roleId: number, hours: number, reason: string) {
    const gmBanRole = makeGMBanRole();
    await gmBanRole.execute({
      roleId,
      time: hours * 3600,
      reason,
    });
  }
  
  async notifyAll(message: string) {
    const chatBroadcast = makeChatBroadcast();
    await chatBroadcast.sendSystem({ message });
  }
}

// Executar exemplos
if (require.main === module) {
  // Configure as ENVs primeiro
  process.env.GAME_SERVER_HOST = '127.0.0.1';
  process.env.GAMEDB_PORT = '29400';
  process.env.GAMEDB_TIMEOUT = '20000';
  process.env.GDELIVERY_PORT = '29100';
  process.env.GDELIVERY_TIMEOUT = '20000';
  process.env.GPROVIDER_PORT = '29300';
  process.env.GPROVIDER_TIMEOUT = '20000';
  
  console.log('🚀 Exemplos de uso das Factories\n');
  
  exemploGameDB()
    .then(() => console.log('\n✅ Exemplo GameDB concluído'))
    .catch(err => console.error('❌ Erro:', err.message));
}

