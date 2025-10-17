/**
 * Exemplos de uso dos protocolos independentes
 * 
 * Todos os protocolos agora são independentes e não requerem GameConnection.
 * Basta chamar o método estático (fetch, send, etc.) diretamente.
 */

import {
  // Protocolos GM
  GMMuteRole,
  GMBanRole,
  GMListOnlineUser,
  
  // Protocolos de Chat
  ChatBroadcast,
  ChatChannel,
  
  // RPCs de Role
  GetRoleBase,
  GetRoleStatus,
  GetRoleBaseStatus,
  GetRolePocket,
  GetRoleEquipment,
  GetRoleStorehouse,
} from '../src';

// Configuração do servidor
const CONFIG = {
  gdeliveryd: { host: '127.0.0.1', port: 29100 },
  gprovider: { host: '127.0.0.1', port: 29300 },
  gamedbd: { host: '127.0.0.1', port: 29400 },
};

/**
 * Exemplo 1: Broadcast de mensagens
 */
async function exemploChat() {
  console.log('=== Exemplo: Chat Broadcast ===\n');
  
  // Mensagem mundial
  await ChatBroadcast.sendWorld(
    CONFIG.gprovider.host,
    CONFIG.gprovider.port,
    {
      message: 'Bem-vindos ao servidor!',
    }
  );
  console.log('✓ Mensagem mundial enviada');
  
  // Mensagem de sistema
  await ChatBroadcast.sendSystem(
    CONFIG.gprovider.host,
    CONFIG.gprovider.port,
    {
      message: 'Manutenção às 02:00',
    }
  );
  console.log('✓ Mensagem de sistema enviada');
  
  // Horn/Megafone
  await ChatBroadcast.sendHorn(
    CONFIG.gprovider.host,
    CONFIG.gprovider.port,
    {
      message: 'Evento especial começando!',
      srcRoleId: 1024,
    }
  );
  console.log('✓ Horn enviado\n');
}

/**
 * Exemplo 2: Gerenciamento de punições
 */
async function exemploPunicoes() {
  console.log('=== Exemplo: Punições ===\n');
  
  const roleId = 1024;
  
  // Mute temporário (1 hora)
  await GMMuteRole.send(
    CONFIG.gdeliveryd.host,
    CONFIG.gdeliveryd.port,
    {
      roleId: roleId,
      time: 3600,
      reason: 'Spam no chat mundial',
    }
  );
  console.log(`✓ Personagem ${roleId} mutado por 1 hora`);
  
  // Remover mute
  await GMMuteRole.unmute(
    CONFIG.gdeliveryd.host,
    CONFIG.gdeliveryd.port,
    {
      roleId: roleId,
      reason: 'Período cumprido',
    }
  );
  console.log(`✓ Mute removido do personagem ${roleId}`);
  
  // Ban temporário (24 horas)
  await GMBanRole.send(
    CONFIG.gdeliveryd.host,
    CONFIG.gdeliveryd.port,
    {
      roleId: roleId,
      time: 86400,
      reason: 'Comportamento tóxico',
    }
  );
  console.log(`✓ Personagem ${roleId} banido por 24 horas\n`);
}

/**
 * Exemplo 3: Buscar dados de personagem
 */
async function exemploBuscaRole() {
  console.log('=== Exemplo: Buscar Role ===\n');
  
  const roleId = 1024;
  
  // Buscar apenas dados básicos
  const base = await GetRoleBase.fetch(
    CONFIG.gamedbd.host,
    CONFIG.gamedbd.port,
    { roleId }
  );
  
  if (base.retcode === 0 && base.base) {
    console.log(`Nome: ${base.base.name}`);
    console.log(`Raça: ${base.base.race}`);
    console.log(`Classe: ${base.base.cls}`);
    console.log(`Gênero: ${base.base.gender}`);
  }
  
  // Buscar apenas status
  const status = await GetRoleStatus.fetch(
    CONFIG.gamedbd.host,
    CONFIG.gamedbd.port,
    { roleId }
  );
  
  if (status.retcode === 0 && status.status) {
    console.log(`Level: ${status.status.level}`);
    console.log(`HP: ${status.status.hp}`);
    console.log(`MP: ${status.status.mp}`);
    console.log(`XP: ${status.status.exp}`);
  }
  
  console.log('');
}

/**
 * Exemplo 4: Buscar base + status (otimizado)
 */
async function exemploBuscaOtimizada() {
  console.log('=== Exemplo: Busca Otimizada ===\n');
  
  const roleId = 1024;
  
  // Uma única chamada para base + status
  const result = await GetRoleBaseStatus.fetch(
    CONFIG.gamedbd.host,
    CONFIG.gamedbd.port,
    { roleId }
  );
  
  if (result.retcode === 0 && result.base && result.status) {
    console.log(`Personagem: ${result.base.name}`);
    console.log(`Level: ${result.status.level}`);
    console.log(`HP/MP: ${result.status.hp}/${result.status.mp}`);
    console.log(`Posição: (${result.status.posx.toFixed(1)}, ${result.status.posy.toFixed(1)}, ${result.status.posz.toFixed(1)})`);
  }
  
  console.log('');
}

/**
 * Exemplo 5: Buscar inventário e equipamentos
 */
async function exemploInventario() {
  console.log('=== Exemplo: Inventário ===\n');
  
  const roleId = 1024;
  
  // Buscar inventário (pocket)
  const pocket = await GetRolePocket.fetch(
    CONFIG.gamedbd.host,
    CONFIG.gamedbd.port,
    { roleId }
  );
  
  if (pocket.retcode === 0 && pocket.pocket) {
    console.log(`Capacidade: ${pocket.pocket.capacity}`);
    console.log(`Dinheiro: ${pocket.pocket.money}`);
    console.log(`Itens: ${pocket.pocket.items.length}`);
  }
  
  // Buscar equipamentos
  const equipment = await GetRoleEquipment.fetch(
    CONFIG.gamedbd.host,
    CONFIG.gamedbd.port,
    { roleId }
  );
  
  if (equipment.retcode === 0) {
    console.log(`Equipamentos: ${equipment.equipment.length}`);
    equipment.equipment.forEach((item, index) => {
      console.log(`  [${index}] ID: ${item.id}, Pos: ${item.pos}, Count: ${item.count}`);
    });
  }
  
  console.log('');
}

/**
 * Exemplo 6: Buscar armazém
 */
async function exemploArmazem() {
  console.log('=== Exemplo: Armazém ===\n');
  
  const roleId = 1024;
  
  const storehouse = await GetRoleStorehouse.fetch(
    CONFIG.gamedbd.host,
    CONFIG.gamedbd.port,
    { roleId }
  );
  
  if (storehouse.retcode === 0 && storehouse.storehouse) {
    console.log(`Capacidade: ${storehouse.storehouse.capacity}`);
    console.log(`Dinheiro: ${storehouse.storehouse.money}`);
    console.log(`Itens: ${storehouse.storehouse.items.length}`);
    console.log(`Roupas: ${storehouse.storehouse.dress.length}`);
    console.log(`Materiais: ${storehouse.storehouse.material.length}`);
    console.log(`Cards: ${storehouse.storehouse.generalcard.length}`);
  }
  
  console.log('');
}

/**
 * Exemplo 7: Lista de jogadores online
 */
async function exemploOnline() {
  console.log('=== Exemplo: Jogadores Online ===\n');
  
  // Buscar apenas uma página
  const { players, nextHandler } = await GMListOnlineUser.fetchPage(
    CONFIG.gdeliveryd.host,
    CONFIG.gdeliveryd.port,
    {
      gmRoleId: 32,
      handler: -1,  // Primeira página
    }
  );
  
  console.log(`Página com ${players.length} jogadores`);
  console.log(`Próximo handler: ${nextHandler}`);
  
  // Buscar TODOS os jogadores (paginação automática)
  const allPlayers = await GMListOnlineUser.fetchAll(
    CONFIG.gdeliveryd.host,
    CONFIG.gdeliveryd.port,
    {
      gmRoleId: 32,
    }
  );
  
  console.log(`\nTotal de jogadores online: ${allPlayers.length}`);
  
  // Mostrar alguns exemplos
  allPlayers.slice(0, 5).forEach(player => {
    console.log(`  - ${player.name} (ID: ${player.roleid}, GSID: ${player.gsid})`);
  });
  
  console.log('');
}

/**
 * Exemplo 8: Requisições paralelas
 */
async function exemploParalelo() {
  console.log('=== Exemplo: Requisições Paralelas ===\n');
  
  const roleId = 1024;
  
  console.time('Paralelo');
  
  // Executar múltiplas requisições simultaneamente
  const [baseStatus, pocket, equipment, storehouse] = await Promise.all([
    GetRoleBaseStatus.fetch(CONFIG.gamedbd.host, CONFIG.gamedbd.port, { roleId }),
    GetRolePocket.fetch(CONFIG.gamedbd.host, CONFIG.gamedbd.port, { roleId }),
    GetRoleEquipment.fetch(CONFIG.gamedbd.host, CONFIG.gamedbd.port, { roleId }),
    GetRoleStorehouse.fetch(CONFIG.gamedbd.host, CONFIG.gamedbd.port, { roleId }),
  ]);
  
  console.timeEnd('Paralelo');
  
  if (baseStatus.retcode === 0 && baseStatus.base) {
    console.log(`\nDados completos de: ${baseStatus.base.name}`);
    console.log(`- Level: ${baseStatus.status?.level}`);
    console.log(`- Itens no inventário: ${pocket.pocket?.items.length ?? 0}`);
    console.log(`- Equipamentos: ${equipment.equipment.length}`);
    console.log(`- Itens no armazém: ${storehouse.storehouse?.items.length ?? 0}`);
  }
  
  console.log('');
}

/**
 * Exemplo 9: Tratamento de erros
 */
async function exemploErros() {
  console.log('=== Exemplo: Tratamento de Erros ===\n');
  
  try {
    // Tentar buscar um personagem que não existe
    const result = await GetRoleBase.fetch(
      CONFIG.gamedbd.host,
      CONFIG.gamedbd.port,
      { roleId: 999999999 }
    );
    
    if (result.retcode !== 0) {
      console.log(`✗ Erro: retcode = ${result.retcode}`);
    } else {
      console.log(`✓ Personagem encontrado: ${result.base?.name}`);
    }
  } catch (error) {
    console.error(`✗ Erro de conexão: ${error}`);
  }
  
  try {
    // Tentar conectar em servidor inválido
    await ChatBroadcast.sendWorld('192.0.2.1', 29300, {
      message: 'Teste',
    });
  } catch (error: any) {
    console.error(`✗ Esperado - erro de conexão: ${error.message}`);
  }
  
  console.log('');
}

/**
 * Executar todos os exemplos
 */
async function main() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║   Exemplos de Protocolos Independentes   ║');
  console.log('╚════════════════════════════════════════════╝\n');
  
  try {
    // Descomente os exemplos que deseja executar
    
    // await exemploChat();
    // await exemploPunicoes();
    await exemploBuscaRole();
    await exemploBuscaOtimizada();
    await exemploInventario();
    await exemploArmazem();
    // await exemploOnline();
    await exemploParalelo();
    await exemploErros();
    
    console.log('✓ Todos os exemplos foram executados com sucesso!\n');
  } catch (error) {
    console.error('✗ Erro ao executar exemplos:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

export {
  exemploChat,
  exemploPunicoes,
  exemploBuscaRole,
  exemploBuscaOtimizada,
  exemploInventario,
  exemploArmazem,
  exemploOnline,
  exemploParalelo,
  exemploErros,
};

