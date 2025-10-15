import { GameConnection } from './GameConnection';
import { GetRoleData } from './protocol/GetRoleData';
import * as fs from 'fs';

const config = {
  host: '127.0.0.1',
  port: 29400,
};

async function testGetRoleData() {
  console.log('=== Exportando GetRoleData para JSON ===\n');
  console.log(`Servidor: ${config.host}:${config.port}\n`);

  const client = new GameConnection(config.host, config.port);

  try {
    await client.connect();

    const roleId = 1073;
    console.log(`\n🔍 Obtendo dados do role ${roleId}...`);

    const getRoleData = new GetRoleData(roleId);
    await client.sendRpc(getRoleData);

    if (getRoleData.retcode === 0 && getRoleData.roleData) {
      const output = {
        roleId,
        retcode: getRoleData.retcode,
        data: {
          base: {
            ...getRoleData.roleData.base,
            custom_data: getRoleData.roleData.base.custom_data?.toString('hex'),
            config_data: getRoleData.roleData.base.config_data?.toString('hex'),
            help_states: getRoleData.roleData.base.help_states?.toString('hex'),
            cross_data: getRoleData.roleData.base.cross_data?.toString('hex'),
          },
          status: getRoleData.roleData.status,
          pocket: getRoleData.roleData.pocket,
          equipment: getRoleData.roleData.equipment,
          storehouse: getRoleData.roleData.storehouse,
          task: getRoleData.roleData.task ? {
            task_data: getRoleData.roleData.task.task_data?.toString('hex'),
            task_complete: getRoleData.roleData.task.task_complete?.toString('hex'),
            task_finishtime: getRoleData.roleData.task.task_finishtime?.toString('hex'),
            task_inventory: getRoleData.roleData.task.task_inventory,
          } : undefined,
        },
      };

      const filename = `role_${roleId}_export.json`;
      fs.writeFileSync(filename, JSON.stringify(output, null, 2));
      console.log(`\n✅ Dados exportados para: ${filename}`);
      
      console.log(`\n📊 Resumo:`);
      console.log(`   - Nome: ${getRoleData.roleData.base.name}`);
      console.log(`   - Level: ${getRoleData.roleData.status?.level}`);
      console.log(`   - Inventário: ${getRoleData.roleData.pocket?.items.length || 0} itens`);
      console.log(`   - Equipamentos: ${getRoleData.roleData.equipment?.items.length || 0} itens`);
      console.log(`   - Armazém: ${getRoleData.roleData.storehouse?.items.length || 0} itens`);
    } else {
      console.log(`\n❌ Erro: retcode = ${getRoleData.retcode}`);
    }

  } catch (error) {
    console.error('\n❌ Erro:', error);
  } finally {
    client.close();
  }
}

testGetRoleData();

