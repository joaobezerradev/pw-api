import { GameConnection } from './GameConnection';
import { GetRoleBase } from './protocol/GetRoleBase';
import { GetRoleStatus } from './protocol/GetRoleStatus';
import { GetRoleBaseStatus } from './protocol/GetRoleBaseStatus';

const config = {
  host: '127.0.0.1',
  port: 29400,
};

async function testBaseAndStatus() {
  console.log('=== Teste GetRoleBase e GetRoleStatus ===\n');
  console.log(`Servidor: ${config.host}:${config.port}\n`);

  const client = new GameConnection(config.host, config.port);
  const roleId = 1073;

  try {
    // Teste 1: GetRoleBase (Dados básicos)
    console.log('📋 Testando GetRoleBase...');
    const baseRpc = await client.call(new GetRoleBase(roleId));
    
    if (baseRpc.retcode === 0 && baseRpc.base) {
      console.log(`✓ Dados básicos obtidos!`);
      console.log(`  - ID: ${baseRpc.base.id}`);
      console.log(`  - Nome: ${baseRpc.base.name}`);
      console.log(`  - Raça: ${baseRpc.base.race}`);
      console.log(`  - Classe: ${baseRpc.base.cls}`);
      console.log(`  - Gênero: ${baseRpc.base.gender === 0 ? 'Masculino' : 'Feminino'}`);
      console.log(`  - User ID: ${baseRpc.base.userid}`);
      console.log(`  - Status: ${baseRpc.base.status}`);
      console.log(`  - Criado em: ${new Date(baseRpc.base.create_time * 1000).toLocaleString('pt-BR')}`);
      console.log(`  - Último login: ${new Date(baseRpc.base.lastlogin_time * 1000).toLocaleString('pt-BR')}`);
    } else {
      console.log(`❌ Erro: retcode = ${baseRpc.retcode}`);
    }

    // Teste 2: GetRoleStatus (Status)
    console.log('\n📊 Testando GetRoleStatus...');
    const statusRpc = await client.call(new GetRoleStatus(roleId));
    
    if (statusRpc.retcode === 0 && statusRpc.status) {
      console.log(`✓ Status obtido!`);
      console.log(`  - Level: ${statusRpc.status.level}`);
      console.log(`  - Level2 (Cultivo): ${statusRpc.status.level2}`);
      console.log(`  - EXP: ${statusRpc.status.exp}`);
      console.log(`  - HP: ${statusRpc.status.hp}`);
      console.log(`  - MP: ${statusRpc.status.mp}`);
      console.log(`  - SP: ${statusRpc.status.sp}`);
      console.log(`  - Posição: (${statusRpc.status.posx.toFixed(2)}, ${statusRpc.status.posy.toFixed(2)}, ${statusRpc.status.posz.toFixed(2)})`);
      console.log(`  - Mapa: ${statusRpc.status.worldtag}`);
      console.log(`  - Reputação: ${statusRpc.status.reputation}`);
    } else {
      console.log(`❌ Erro: retcode = ${statusRpc.retcode}`);
    }

    // Teste 3: GetRoleBaseStatus (Base + Status em uma chamada)
    console.log('\n🎯 Testando GetRoleBaseStatus (mais eficiente)...');
    const bothRpc = await client.call(new GetRoleBaseStatus(roleId));
    
    if (bothRpc.retcode === 0 && bothRpc.base && bothRpc.status) {
      console.log(`✓ Base + Status obtidos em uma chamada!`);
      console.log(`  - Nome: ${bothRpc.base.name} (ID: ${bothRpc.base.id})`);
      console.log(`  - Level: ${bothRpc.status.level}`);
      console.log(`  - HP: ${bothRpc.status.hp} / MP: ${bothRpc.status.mp}`);
      console.log(`  - Posição: (${bothRpc.status.posx.toFixed(2)}, ${bothRpc.status.posy.toFixed(2)}, ${bothRpc.status.posz.toFixed(2)})`);
      console.log(`  - Mapa: ${bothRpc.status.worldtag}`);
    } else {
      console.log(`❌ Erro: retcode = ${bothRpc.retcode}`);
    }

    console.log('\n💡 Dica: Use GetRoleBaseStatus para obter base + status');
    console.log('   de forma mais eficiente (1 conexão ao invés de 2)!\n');

    console.log('✅ Testes concluídos!\n');

  } catch (error) {
    console.error('\n❌ Erro:', error);
  } finally {
    client.disconnect();
  }
}

testBaseAndStatus();

