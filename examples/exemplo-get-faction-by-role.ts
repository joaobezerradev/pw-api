/**
 * Exemplo - Obter Facção pelo RoleId
 * 
 * Como não há um RPC direto para obter a facção pelo roleId,
 * este exemplo mostra como fazer em 2 etapas:
 * 1. Obter dados do personagem (incluindo factionId)
 * 2. Obter dados da facção usando o factionId
 */
import { GameConnection, GetRoleBase, LogLevel } from '../src';
import { GetFactionInfo } from '../src/actions/get-faction-info';

const config = {
  host: '127.0.0.1',
  port: 29400,
};

async function getFactionByRole(connection: GameConnection, roleId: number) {
  try {
    // Etapa 1: Obter dados do personagem para pegar o factionId
    console.log(`📦 Buscando dados do personagem (roleId: ${roleId})...`);
    const roleRpc = await connection.call(new GetRoleBase({ roleId }));
    
    if (roleRpc.output.retcode !== 0 || !roleRpc.output.base) {
      console.log('❌ Personagem não encontrado');
      return null;
    }
    
    const personagem = roleRpc.output.base;
    console.log(`✓ Personagem: ${personagem.name}`);
    
    // NOTA: GRoleBase não tem factionId diretamente
    // Você precisaria usar outro RPC que retorne factionId
    // Por exemplo: consulta direta ao banco de dados
    
    console.log('\n⚠️  NOTA: GRoleBase não contém factionId');
    console.log('Para obter a facção, você precisa:');
    console.log('1. Consultar o banco de dados diretamente');
    console.log('2. Ou usar outro RPC que retorne factionId (se disponível)');
    
    // Se você já sabe o factionId (por exemplo, do banco de dados):
    const factionId = 11; // Exemplo
    
    // Etapa 2: Obter dados da facção
    console.log(`\n📦 Buscando dados da facção (factionId: ${factionId})...`);
    const factionRpc = await connection.call(new GetFactionInfo({ factionId }));
    
    if (factionRpc.output.retcode === 0 && factionRpc.output.faction) {
      const faction = factionRpc.output.faction;
      
      console.log(`\n✅ Facção encontrada:`);
      console.log(`  Nome: ${faction.name}`);
      console.log(`  Level: ${faction.level}`);
      console.log(`  Líder ID: ${faction.masterid}`);
      console.log(`  Total de membros: ${faction.count}`);
      console.log(`  Anúncio: ${faction.announce || '(vazio)'}`);
      
      if (faction.members.length > 0) {
        console.log(`\n  Membros:`);
        faction.members.slice(0, 5).forEach((member, i) => {
          console.log(`    ${i + 1}. ID: ${member.memberid}, Cargo: ${member.memberrole}`);
        });
        if (faction.members.length > 5) {
          console.log(`    ... e mais ${faction.members.length - 5} membros`);
        }
      }
      
      return faction;
    }
    
    return null;
    
  } catch (error) {
    console.error('\n❌ Erro:', error);
    return null;
  }
}

async function main() {
  console.log('=== Exemplo: Obter Facção pelo RoleId ===\n');
  
  const connection = new GameConnection(config.host, config.port, LogLevel.INFO);
  
  const roleId = 1073;
  await getFactionByRole(connection, roleId);
}

main();

