import { GameConnection } from './GameConnection';
import { GetRoleData } from './protocol/GetRoleData';
import { getServerConfig } from './config';
import * as fs from 'fs';

/**
 * Dump em hex para análise
 */
async function main() {
  const config = getServerConfig('GAMEDBD');
  const { host: HOST, port: PORT } = config;

  const client = new GameConnection(HOST, PORT);

  const roleId = 1073;

  try {
    console.log(`Buscando Role ID: ${roleId}...`);

    const rpc = new GetRoleData();
    rpc.setRoleId(roleId);

    const result = await client.call(rpc, 10000);

    console.log(`✓ Retcode: ${result.getRetcode()}`);
    
    const roleData = result.getRoleData();
    
    if (roleData) {
      // Salvar apenas as estatísticas básicas
      console.log('\n📊 RESUMO:');
      console.log(`  Base: ✓`);
      console.log(`  Status: ${roleData.status ? '✓' : '✗'}`);
      console.log(`  Pocket: ${roleData.pocket ? `✓ (${roleData.pocket.items.length} itens, ${roleData.pocket.money} gold)` : '✗'}`);
      console.log(`  Equipment: ${roleData.equipment ? `✓ (${roleData.equipment.items.length} itens)` : '✗'}`);
      console.log(`  Storehouse: ${roleData.storehouse ? `✓ (${roleData.storehouse.items.length} itens, ${roleData.storehouse.money} gold)` : '✗'}`);
      console.log(`  Task: ${roleData.task ? '✓' : '✗'}`);
      
      // Exportar dados
      const exportData = {
        roleId,
        timestamp: new Date().toISOString(),
        base: {
          id: roleData.base.id,
          name: roleData.base.name,
          race: roleData.base.race,
          cls: roleData.base.cls,
          gender: roleData.base.gender,
          userid: roleData.base.userid,
          status: roleData.base.status,
          create_time: roleData.base.create_time,
          lastlogin_time: roleData.base.lastlogin_time,
        },
        status: roleData.status ? {
          level: roleData.status.level,
          exp: roleData.status.exp,
          hp: roleData.status.hp,
          mp: roleData.status.mp,
          posx: roleData.status.posx,
          posy: roleData.status.posy,
          posz: roleData.status.posz,
        } : null,
        pocket: roleData.pocket ? {
          capacity: roleData.pocket.capacity,
          money: roleData.pocket.money,
          itemCount: roleData.pocket.items.length,
          items: roleData.pocket.items.map(item => ({
            id: item.id,
            pos: item.pos,
            count: item.count,
            max_count: item.max_count,
            proctype: item.proctype,
            expire_date: item.expire_date,
            data_size: item.data.length,
          }))
        } : null,
        equipment: roleData.equipment ? {
          itemCount: roleData.equipment.items.length,
          items: roleData.equipment.items.map(item => ({
            id: item.id,
            pos: item.pos,
            count: item.count,
            max_count: item.max_count,
            proctype: item.proctype,
            data_size: item.data.length,
          }))
        } : null,
        storehouse: roleData.storehouse ? {
          capacity: roleData.storehouse.capacity,
          money: roleData.storehouse.money,
          itemCount: roleData.storehouse.items.length,
          dressCount: roleData.storehouse.dress?.length || 0,
          materialCount: roleData.storehouse.material?.length || 0,
          cardCount: roleData.storehouse.generalcard?.length || 0,
        } : null,
      };
      
      const jsonFile = `role_${roleId}_summary.json`;
      fs.writeFileSync(jsonFile, JSON.stringify(exportData, null, 2));
      console.log(`\n✓ Dados salvos em: ${jsonFile}`);
    }

  } catch (error: any) {
    console.error(`\n❌ Erro:`, error.message);
  }
  
  client.disconnect();
}

if (require.main === module) {
  main().catch(console.error);
}


