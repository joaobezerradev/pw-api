import { GameConnection, LogLevel } from './src';
import { GetUserFaction } from './src/actions/get-user-faction';

async function test() {
  console.log('=== Testando GetUserFaction (corrigido com 3 parâmetros) ===\n');
  
  const connection = new GameConnection('127.0.0.1', 29400, LogLevel.INFO);
  
  try {
    const roleId = 1073;
    console.log(`📦 Consultando roleId: ${roleId}...\n`);
    
    const rpc = await connection.call(new GetUserFaction({ roleId }));
    
    if (rpc.output.retcode === 0 && rpc.output.faction) {
      console.log('✅ SUCESSO! Dados obtidos:\n');
      console.log(JSON.stringify(rpc.output.faction, null, 2));
      
      const f = rpc.output.faction;
      console.log('\n📊 Resumo:');
      console.log(`  Personagem: ${f.name} (ID: ${f.roleid})`);
      console.log(`  Facção ID: ${f.factionid}`);
      console.log(`  Classe: ${f.cls}`);
      console.log(`  Cargo: ${f.role}`);
      console.log(`  Apelido: ${f.nickname || '(vazio)'}`);
    } else {
      console.log('❌ Erro - Retcode:', rpc.output.retcode);
    }
    
  } catch (err: any) {
    console.error('\n❌ Erro:', err.message);
  }
}

test();
