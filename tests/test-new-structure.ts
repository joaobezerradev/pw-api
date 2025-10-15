import { GameConnection } from '../src/GameConnection';
import { GetRoleBase } from '../src/protocols/GetRoleBase';
import { GetRoleStatus } from '../src/protocols/GetRoleStatus';
import { GetRoleBaseStatus } from '../src/protocols/GetRoleBaseStatus';
import { GetRolePocket } from '../src/protocols/GetRolePocket';
import { GetRoleEquipment } from '../src/protocols/GetRoleEquipment';
import { GetRoleStorehouse } from '../src/protocols/GetRoleStorehouse';

const config = {
  host: '127.0.0.1',
  port: 29400,
};

async function testNewStructure() {
  console.log('=== Teste Nova Estrutura Modular ===\n');
  
  const client = new GameConnection(config.host, config.port);
  const roleId = 1073;

  try {
    // Teste 1: GetRoleBase
    console.log('📋 Testando GetRoleBase...');
    const baseRpc = await client.call(new GetRoleBase({ roleId }));
    
    if (baseRpc.output.retcode === 0 && baseRpc.output.base) {
      console.log(`✓ Nome: ${baseRpc.output.base.name} (ID: ${baseRpc.output.base.id})`);
      console.log(`  Raça: ${baseRpc.output.base.race}, Classe: ${baseRpc.output.base.cls}`);
    }

    // Teste 2: GetRoleStatus
    console.log('\n📊 Testando GetRoleStatus...');
    const statusRpc = await client.call(new GetRoleStatus({ roleId }));
    
    if (statusRpc.output.retcode === 0 && statusRpc.output.status) {
      console.log(`✓ Level: ${statusRpc.output.status.level}`);
      console.log(`  HP: ${statusRpc.output.status.hp}, MP: ${statusRpc.output.status.mp}`);
      console.log(`  Posição: (${statusRpc.output.status.posx.toFixed(2)}, ${statusRpc.output.status.posy.toFixed(2)}, ${statusRpc.output.status.posz.toFixed(2)})`);
    }

    // Teste 3: GetRoleBaseStatus
    console.log('\n🎯 Testando GetRoleBaseStatus...');
    const bothRpc = await client.call(new GetRoleBaseStatus({ roleId }));
    
    if (bothRpc.output.retcode === 0 && bothRpc.output.base && bothRpc.output.status) {
      console.log(`✓ ${bothRpc.output.base.name} - Level ${bothRpc.output.status.level}`);
    }

    // Teste 4: GetRolePocket
    console.log('\n📦 Testando GetRolePocket...');
    const pocketRpc = await client.call(new GetRolePocket({ roleId }));
    
    if (pocketRpc.output.retcode === 0 && pocketRpc.output.pocket) {
      console.log(`✓ Dinheiro: ${pocketRpc.output.pocket.money}`);
      console.log(`  Itens: ${pocketRpc.output.pocket.items.length}/${pocketRpc.output.pocket.capacity}`);
    }

    // Teste 5: GetRoleEquipment
    console.log('\n⚔️  Testando GetRoleEquipment...');
    const equipRpc = await client.call(new GetRoleEquipment({ roleId }));
    
    if (equipRpc.output.retcode === 0) {
      console.log(`✓ Equipamentos: ${equipRpc.output.equipment.length} itens`);
    }

    // Teste 6: GetRoleStorehouse
    console.log('\n🏦 Testando GetRoleStorehouse...');
    const storeRpc = await client.call(new GetRoleStorehouse({ roleId }));
    
    if (storeRpc.output.retcode === 0 && storeRpc.output.storehouse) {
      console.log(`✓ Dinheiro no banco: ${storeRpc.output.storehouse.money}`);
      console.log(`  Itens: ${storeRpc.output.storehouse.items.length}`);
      console.log(`  Materiais: ${storeRpc.output.storehouse.dress.length}`);
      console.log(`  Fashion: ${storeRpc.output.storehouse.material.length}`);
      console.log(`  Cards: ${storeRpc.output.storehouse.generalcard.length}`);
    }

    console.log('\n✅ Todos os testes concluídos!\n');

  } catch (error) {
    console.error('\n❌ Erro:', error);
  } finally {
    client.disconnect();
  }
}

testNewStructure();

