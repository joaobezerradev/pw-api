/**
 * Exemplo - Obter Facção do Personagem (GetUserFaction)
 */
import { GameConnection, LogLevel } from '../src';
import { GetUserFaction } from '../src/actions/get-user-faction';
import { GetFactionInfo } from '../src/actions/get-faction-info';

const config = {
  host: '127.0.0.1',
  port: 29400,
};

async function exemploCompleto() {
  console.log('=== Exemplo: GetUserFaction + GetFactionInfo ===\n');
  
  const connection = new GameConnection(config.host, config.port, LogLevel.INFO);
  
  try {
    const roleId = 1073;
    
    // Etapa 1: Obter dados da facção do personagem
    console.log(`📦 Etapa 1: Buscando facção do personagem (roleId: ${roleId})...\n`);
    
    const userFactionRpc = await connection.call(new GetUserFaction({ roleId }));
    
    if (userFactionRpc.output.retcode !== 0 || !userFactionRpc.output.faction) {
      console.log('❌ Personagem não encontrado ou não está em facção');
      return;
    }
    
    const userFaction = userFactionRpc.output.faction;
    
    console.log('✅ Dados do personagem na facção:');
    console.log(`  Personagem: ${userFaction.name} (ID: ${userFaction.roleid})`);
    console.log(`  Facção ID: ${userFaction.factionid}`);
    console.log(`  Cargo: ${userFaction.role}`);
    console.log(`  Apelido: ${userFaction.nickname || '(não definido)'}`);
    
    // Etapa 2: Obter informações completas da facção (opcional)
    if (userFaction.factionid > 0) {
      console.log(`\n📦 Etapa 2: Buscando dados completos da facção (factionId: ${userFaction.factionid})...\n`);
      
      const factionInfoRpc = await connection.call(
        new GetFactionInfo({ factionId: userFaction.factionid })
      );
      
      if (factionInfoRpc.output.retcode === 0 && factionInfoRpc.output.faction) {
        const faction = factionInfoRpc.output.faction;
        
        console.log('✅ Informações da Facção:');
        console.log(`  Nome: ${faction.name}`);
        console.log(`  Level: ${faction.level}`);
        console.log(`  Líder ID: ${faction.masterid}`);
        console.log(`  Total de membros: ${faction.count}`);
        
        if (faction.announce) {
          console.log(`  Anúncio: ${faction.announce}`);
        }
      }
    } else {
      console.log('\n⚠️  Personagem não está em nenhuma facção');
    }
    
  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
  }
}

exemploCompleto();

