/**
 * Exemplo - Usando RoleService (camada de serviço)
 */
import { GameConnection, RoleService } from '../src';

const config = {
  host: '127.0.0.1',
  port: 29400,
};

async function exemploComService() {
  console.log('=== Exemplo usando RoleService ===\n');

  // 1. Criar cliente e service
  const client = new GameConnection(config.host, config.port);
  const roleService = new RoleService(client);

  const roleId = 1073;

  try {
    // 2. Obter dados completos do personagem (paralelo e otimizado)
    console.log('📦 Buscando dados completos do personagem...\n');
    const fullData = await roleService.getFullData(roleId);

    if (!fullData) {
      console.log('❌ Personagem não encontrado');
      return;
    }

    // 3. Exibir resultados
    console.log(`✓ Personagem: ${fullData.base.name}`);
    console.log(`  ID: ${fullData.base.id}`);
    console.log(`  User ID: ${fullData.base.userid}`);
    console.log(`  Level: ${fullData.status.level}`);
    console.log(`  HP: ${fullData.status.hp} / MP: ${fullData.status.mp}`);
    console.log(`  Posição: (${fullData.status.posx.toFixed(2)}, ${fullData.status.posy.toFixed(2)}, ${fullData.status.posz.toFixed(2)})`);

    if (fullData.pocket) {
      console.log(`\n💰 Dinheiro: ${fullData.pocket.money}`);
      console.log(`📦 Itens no inventário: ${fullData.pocket.items.length}/${fullData.pocket.capacity}`);
    }

    console.log(`⚔️  Equipamentos: ${fullData.equipment.length} itens`);

    if (fullData.storehouse) {
      console.log(`\n🏦 Armazém:`);
      console.log(`   Dinheiro: ${fullData.storehouse.money}`);
      console.log(`   Itens: ${fullData.storehouse.items.length}`);
      console.log(`   Materiais: ${fullData.storehouse.dress.length}`);
      console.log(`   Fashion: ${fullData.storehouse.material.length}`);
      console.log(`   Cards: ${fullData.storehouse.generalcard.length}`);
    }

    // 4. Exemplo de consulta individual
    console.log('\n📊 Consultando apenas status...');
    const status = await roleService.getStatus(roleId);
    if (status) {
      console.log(`✓ Level: ${status.level}, EXP: ${status.exp}`);
    }

  } catch (error) {
    console.error('\n❌ Erro:', error);
  } finally {
    client.disconnect();
  }
}

exemploComService();

