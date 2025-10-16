/**
 * Exemplo - Listar Usuários Online (GMListOnlineUser)
 */
import { GMListOnlineUser } from '../src';

const config = {
  host: '127.0.0.1',
  port: 29100,  // GDELIVERYD
};

async function exemploOnlineList() {
  console.log('=== Exemplo: Listar Usuários Online ===\n');
  
  try {
    // Buscar TODOS os usuários online (loop automático)
    console.log('👥 Buscando Usuários Online');
    console.log('─'.repeat(50));
    console.log('GM RoleID: 32');
    console.log('Porta: 29100 (GDELIVERYD)');
    console.log('⚠️  Loop automático - busca TODOS os usuários\n');
    
    const startTime = Date.now();
    
    const players = await GMListOnlineUser.fetchAll(config.host, config.port, {
      gmRoleId: 1073,
      localsid: 1,
    });
    
    const elapsed = Date.now() - startTime;
    
    console.log(`\n✅ Total de jogadores online: ${players.length}`);
    console.log(`⏱️  Tempo: ${elapsed}ms\n`);
    
    if (players.length > 0) {
      console.log('─'.repeat(50));
      console.log('🎮 Jogadores Online:\n');
      
      players.forEach((player, index) => {
        console.log(`${index + 1}. ${player.name}`);
        console.log(`   RoleID: ${player.roleid}`);
        console.log(`   UserID: ${player.userid}`);
        console.log(`   Status: ${player.status}`);
        console.log(`   GSID: ${player.gsid}`);
        console.log(`   LinkID: ${player.linkid}`);
        console.log('');
      });
      
      // Estatísticas
      console.log('─'.repeat(50));
      console.log('📊 Estatísticas:');
      console.log('─'.repeat(50));
      console.log(`• Total de jogadores: ${players.length}`);
      
      const uniqueUsers = new Set(players.map(p => p.userid)).size;
      console.log(`• Contas únicas: ${uniqueUsers}`);
      
      const byStatus = players.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      console.log('• Status:');
      Object.entries(byStatus).forEach(([status, count]) => {
        console.log(`  - Status ${status}: ${count} jogadores`);
      });
      
    } else {
      console.log('📭 Nenhum jogador online no momento.');
    }
    
    console.log('\n' + '═'.repeat(50));
    console.log('💡 Informações:');
    console.log('═'.repeat(50));
    console.log('• Protocol Type: 352 (0x160) - Request');
    console.log('• Response Type: 353 (0x161) - GMListOnlineUser_Re');
    console.log('• Porta: 29100 (GDELIVERYD)');
    console.log('• Tipo: Protocol Request/Response com paginação');
    console.log('• Loop automático: SIM (sem limite de iterações)');
    console.log('• Fim: Quando handler = 0xFFFFFFFF (4294967295)');
    console.log('\n📋 Campos do jogador:');
    console.log('• userid: ID da conta');
    console.log('• roleid: ID do personagem');
    console.log('• linkid: ID da conexão');
    console.log('• localsid: Local session ID');
    console.log('• gsid: Game Server ID');
    console.log('• status: Status do jogador');
    console.log('• name: Nome do personagem');
    console.log('\n💡 Uso:');
    console.log('• Monitorar jogadores online');
    console.log('• Estatísticas do servidor');
    console.log('• Moderação/Administração');
    console.log('• Paginação automática (busca TODOS)');
    
  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
  }
}

exemploOnlineList();

