import { GameConnection } from './GameConnection';
import { GetRolePocket } from './protocol/GetRolePocket';
import { GetRoleEquipment } from './protocol/GetRoleEquipment';
import { GetRoleStorehouse } from './protocol/GetRoleStorehouse';

const config = {
  host: '127.0.0.1',
  port: 29400,
};

async function testSeparateRPCs() {
  console.log('=== Teste de RPCs Separados ===\n');
  console.log(`Servidor: ${config.host}:${config.port}\n`);

  const client = new GameConnection(config.host, config.port);
  const roleId = 1073;

  try {
    // Teste 1: GetRolePocket (Inventário)
    console.log('\n📦 Testando GetRolePocket...');
    const pocketRpc = await client.call(new GetRolePocket(roleId));
    
    if (pocketRpc.retcode === 0 && pocketRpc.pocket) {
      console.log(`✓ Inventário obtido com sucesso!`);
      console.log(`  - Capacidade: ${pocketRpc.pocket.capacity}`);
      console.log(`  - Dinheiro: ${pocketRpc.pocket.money} moedas`);
      console.log(`  - Itens: ${pocketRpc.pocket.items.length}`);
      
      if (pocketRpc.pocket.items.length > 0) {
        console.log('\n  Primeiros itens:');
        pocketRpc.pocket.items.slice(0, 3).forEach((item, i) => {
          console.log(`    ${i + 1}. ID: ${item.id}, Pos: ${item.pos}, Count: ${item.count}`);
        });
      }
    } else {
      console.log(`❌ Erro: retcode = ${pocketRpc.retcode}`);
    }

    // Teste 2: GetRoleEquipment (Equipamentos)
    console.log('\n⚔️  Testando GetRoleEquipment...');
    const equipRpc = await client.call(new GetRoleEquipment(roleId));
    
    if (equipRpc.retcode === 0) {
      console.log(`✓ Equipamentos obtidos com sucesso!`);
      console.log(`  - Total: ${equipRpc.equipment.length} itens equipados`);
      
      if (equipRpc.equipment.length > 0) {
        console.log('\n  Equipamentos:');
        equipRpc.equipment.forEach((item, i) => {
          console.log(`    ${i + 1}. ID: ${item.id}, Pos: ${item.pos}`);
        });
      }
    } else {
      console.log(`❌ Erro: retcode = ${equipRpc.retcode}`);
    }

    // Teste 3: GetRoleStorehouse (Armazém)
    console.log('\n🏦 Testando GetRoleStorehouse...');
    const storeRpc = await client.call(new GetRoleStorehouse(roleId));
    
    if (storeRpc.retcode === 0 && storeRpc.storehouse) {
      console.log(`✓ Armazém obtido com sucesso!`);
      console.log(`  - Capacidade: ${storeRpc.storehouse.capacity}`);
      console.log(`  - Dinheiro: ${storeRpc.storehouse.money} moedas`);
      console.log(`  - Itens normais: ${storeRpc.storehouse.items.length}`);
      console.log(`  - Materiais: ${storeRpc.storehouse.dress.length}`);
      console.log(`  - Fashion: ${storeRpc.storehouse.material.length}`);
      console.log(`  - Cards: ${storeRpc.storehouse.generalcard.length}`);
      
      const totalItems = storeRpc.storehouse.items.length + 
                        storeRpc.storehouse.dress.length +
                        storeRpc.storehouse.material.length +
                        storeRpc.storehouse.generalcard.length;
      console.log(`  - Total de itens: ${totalItems}`);
    } else {
      console.log(`❌ Erro: retcode = ${storeRpc.retcode}`);
    }

    console.log('\n✅ Testes concluídos!\n');

  } catch (error) {
    console.error('\n❌ Erro:', error);
  } finally {
    client.disconnect();
  }
}

testSeparateRPCs();

