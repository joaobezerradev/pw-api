import { GameConnection } from './GameConnection';
import { GetRoleData } from './protocol/GetRoleData';
import { getServerConfig } from './config';
import * as fs from 'fs';

/**
 * Dump completo dos dados do personagem
 */
async function main() {
  const config = getServerConfig('GAMEDBD');
  const { host: HOST, port: PORT } = config;

  console.log('=== DUMP COMPLETO DE DADOS DO PERSONAGEM ===\n');
  console.log(`Servidor: ${HOST}:${PORT}\n`);

  const client = new GameConnection(HOST, PORT);

  const roleId = 1073;

  try {
    console.log(`Buscando dados completos do Role ID: ${roleId}...\n`);

    const rpc = new GetRoleData();
    rpc.setRoleId(roleId);

    const result = await client.call(rpc, 10000);

    const retcode = result.getRetcode();
    console.log(`✓ Retcode: ${retcode}\n`);

    if (retcode === 0) {
      const roleData = result.getRoleData();
      const roleBase = result.getRoleBase();
      
      if (roleData && roleBase) {
        console.log('═══════════════════════════════════════════════════════════');
        console.log('                    DADOS BASE (GRoleBase)');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        console.log('📋 Informações Gerais:');
        console.log('─'.repeat(60));
        console.log(`  Version:          ${roleBase.version}`);
        console.log(`  ID:               ${roleBase.id}`);
        console.log(`  Nome:             "${roleBase.name}"`);
        console.log(`  Raça:             ${roleBase.race}`);
        console.log(`  Classe:           ${roleBase.cls}`);
        console.log(`  Gênero:           ${roleBase.gender} (${roleBase.gender === 0 ? 'Masculino' : 'Feminino'})`);
        console.log(`  User ID:          ${roleBase.userid}`);
        
        console.log('\n📊 Status & Timestamps:');
        console.log('─'.repeat(60));
        const statusText = ['Normal', 'Aguardando Deleção', 'Deletado'][roleBase.status || 0] || 'Desconhecido';
        console.log(`  Status:           ${roleBase.status} (${statusText})`);
        console.log(`  Custom Stamp:     ${roleBase.custom_stamp}`);
        
        if (roleBase.create_time) {
          const createDate = new Date(roleBase.create_time * 1000);
          console.log(`  Criado em:        ${createDate.toLocaleString('pt-BR')} (${roleBase.create_time})`);
        }
        
        if (roleBase.lastlogin_time) {
          const lastLogin = new Date(roleBase.lastlogin_time * 1000);
          console.log(`  Último login:     ${lastLogin.toLocaleString('pt-BR')} (${roleBase.lastlogin_time})`);
        }
        
        if (roleBase.delete_time) {
          if (roleBase.delete_time > 0) {
            const deleteDate = new Date(roleBase.delete_time * 1000);
            console.log(`  Data de deleção:  ${deleteDate.toLocaleString('pt-BR')} (${roleBase.delete_time})`);
          } else {
            console.log(`  Data de deleção:  ${roleBase.delete_time} (não agendado)`);
          }
        }
        
        console.log('\n💑 Relacionamentos:');
        console.log('─'.repeat(60));
        if (roleBase.spouse && roleBase.spouse > 0) {
          console.log(`  Cônjuge ID:       ${roleBase.spouse}`);
        } else {
          console.log(`  Cônjuge:          Nenhum`);
        }
        
        console.log('\n📦 Dados Binários:');
        console.log('─'.repeat(60));
        console.log(`  Custom Data:      ${roleBase.custom_data?.length || 0} bytes`);
        if (roleBase.custom_data && roleBase.custom_data.length > 0) {
          console.log(`    Hex: ${roleBase.custom_data.slice(0, 64).toString('hex')}${roleBase.custom_data.length > 64 ? '...' : ''}`);
        }
        
        console.log(`  Config Data:      ${roleBase.config_data?.length || 0} bytes`);
        if (roleBase.config_data && roleBase.config_data.length > 0) {
          console.log(`    Hex: ${roleBase.config_data.slice(0, 64).toString('hex')}${roleBase.config_data.length > 64 ? '...' : ''}`);
        }
        
        console.log(`  Help States:      ${roleBase.help_states?.length || 0} bytes`);
        if (roleBase.help_states && roleBase.help_states.length > 0) {
          console.log(`    Hex: ${roleBase.help_states.slice(0, 64).toString('hex')}${roleBase.help_states.length > 64 ? '...' : ''}`);
        }
        
        console.log(`  Cross Data:       ${roleBase.cross_data?.length || 0} bytes`);
        if (roleBase.cross_data && roleBase.cross_data.length > 0) {
          console.log(`    Hex: ${roleBase.cross_data.slice(0, 64).toString('hex')}${roleBase.cross_data.length > 64 ? '...' : ''}`);
        }
        
        if (roleBase.forbid && roleBase.forbid.length > 0) {
          console.log('\n⚠️  PUNIÇÕES ATIVAS:');
          console.log('─'.repeat(60));
          roleBase.forbid.forEach((ban, index) => {
            const typeText = {
              100: 'Ban de Role (completo)',
              101: 'Ban de Chat',
              102: 'Ban Tipo 102',
              103: 'Ban Tipo 103'
            }[ban.type] || `Tipo ${ban.type}`;
            
            console.log(`\n  Punição #${index + 1}:`);
            console.log(`    Tipo:           ${ban.type} - ${typeText}`);
            console.log(`    Duração:        ${ban.time}s ${ban.time === 0 ? '(permanente)' : ''}`);
            
            if (ban.createtime) {
              const createDate = new Date(ban.createtime * 1000);
              console.log(`    Criado em:      ${createDate.toLocaleString('pt-BR')}`);
            }
            
            if (ban.reason && ban.reason.length > 0) {
              const reason = ban.reason.toString('utf16le');
              console.log(`    Razão:          "${reason}"`);
            }
          });
        } else {
          console.log('\n✅ Sem punições ativas');
        }
        
        // STATUS
        if (roleData.status) {
          console.log('\n═══════════════════════════════════════════════════════════');
          console.log('                   STATUS (GRoleStatus)');
          console.log('═══════════════════════════════════════════════════════════\n');
          
          const status = roleData.status;
          
          console.log('📊 Progressão:');
          console.log('─'.repeat(60));
          if (status.version !== undefined) console.log(`  Version:          ${status.version}`);
          if (status.level !== undefined) console.log(`  Level:            ${status.level}`);
          if (status.level2 !== undefined) console.log(`  Level2 (Cultiv):  ${status.level2}`);
          if (status.exp !== undefined) console.log(`  EXP:              ${status.exp.toLocaleString()}`);
          if (status.sp !== undefined) console.log(`  SP (Spirit):      ${status.sp.toLocaleString()}`);
          if (status.pp !== undefined) console.log(`  PP (Prestige):    ${status.pp.toLocaleString()}`);
          
          console.log('\n❤️  Atributos:');
          console.log('─'.repeat(60));
          if (status.hp !== undefined) console.log(`  HP:               ${status.hp.toLocaleString()}`);
          if (status.mp !== undefined) console.log(`  MP:               ${status.mp.toLocaleString()}`);
          
          console.log('\n🗺️  Localização:');
          console.log('─'.repeat(60));
          if (status.posx !== undefined) {
            console.log(`  Posição X:        ${status.posx.toFixed(2)}`);
            console.log(`  Posição Y:        ${status.posy?.toFixed(2)}`);
            console.log(`  Posição Z:        ${status.posz?.toFixed(2)}`);
            console.log(`  Coordenadas:      (${status.posx.toFixed(2)}, ${status.posy?.toFixed(2)}, ${status.posz?.toFixed(2)})`);
          }
          if (status.worldtag !== undefined) {
            console.log(`  Mapa (WorldTag):  ${status.worldtag}`);
          }
          
          console.log('\n⚔️  PvP & Reputação:');
          console.log('─'.repeat(60));
          if (status.invader_state !== undefined) console.log(`  Invader State:    ${status.invader_state}`);
          if (status.invader_time !== undefined) console.log(`  Invader Time:     ${status.invader_time}`);
          if (status.pariah_time !== undefined) console.log(`  Pariah Time:      ${status.pariah_time}`);
          if (status.reputation !== undefined) console.log(`  Reputação:        ${status.reputation}`);
        }
        
        // SALVAR JSON
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('                     EXPORTAÇÃO');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        const exportData = {
          roleId,
          timestamp: new Date().toISOString(),
          base: {
            ...roleBase,
            custom_data: roleBase.custom_data?.toString('hex'),
            config_data: roleBase.config_data?.toString('hex'),
            help_states: roleBase.help_states?.toString('hex'),
            cross_data: roleBase.cross_data?.toString('hex'),
          },
          status: roleData.status
        };
        
        const jsonFile = `role_${roleId}_dump.json`;
        fs.writeFileSync(jsonFile, JSON.stringify(exportData, null, 2));
        console.log(`✓ Dados salvos em: ${jsonFile}`);
        
        // ESTATÍSTICAS
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('                    ESTATÍSTICAS');
        console.log('═══════════════════════════════════════════════════════════\n');
        
        let totalBytes = 0;
        totalBytes += roleBase.custom_data?.length || 0;
        totalBytes += roleBase.config_data?.length || 0;
        totalBytes += roleBase.help_states?.length || 0;
        totalBytes += roleBase.cross_data?.length || 0;
        
        console.log(`  Campos lidos:     ${Object.keys(roleBase).length} (base) + ${Object.keys(roleData.status || {}).length} (status)`);
        console.log(`  Dados binários:   ${totalBytes} bytes`);
        console.log(`  Punições:         ${roleBase.forbid?.length || 0}`);
        console.log(`  Cônjuge:          ${roleBase.spouse ? 'Sim' : 'Não'}`);
        
      } else {
        console.log('❌ Nenhum dado retornado');
      }

    } else if (retcode === -1) {
      console.log('❌ Personagem não encontrado');
    } else {
      console.log(`⚠️  Erro: retcode = ${retcode}`);
    }

  } catch (error: any) {
    console.error(`\n❌ Erro:`, error.message);
  }
  
  client.disconnect();
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                    FIM DO DUMP');
  console.log('═══════════════════════════════════════════════════════════\n');
}

if (require.main === module) {
  main().catch(console.error);
}


