import { GameConnection } from './GameConnection';
import { GetRoleData } from './protocol/GetRoleData';
import { getServerConfig } from './config';

/**
 * Teste do GetRoleData (RPC completo)
 */
async function main() {
  const config = getServerConfig('GAMEDBD');
  const { host: HOST, port: PORT } = config;

  console.log('=== Teste GetRoleData (8003 / 0x1F43) ===\n');
  console.log(`Servidor: ${HOST}:${PORT}\n`);

  const client = new GameConnection(HOST, PORT);

  // Lista de IDs para testar
  const roleIds = [1073];

  for (const roleId of roleIds) {
    try {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Testando Role ID: ${roleId}`);
      console.log('='.repeat(60));

      const rpc = new GetRoleData();
      rpc.setRoleId(roleId);

      const result = await client.call(rpc, 10000);

      const retcode = result.getRetcode();
      console.log(`\n✓ Retcode: ${retcode}`);

      if (retcode === 0) {
        const roleBase = result.getRoleBase();
        
        if (roleBase) {
          console.log('\n📋 Informações do Personagem:');
          console.log('─'.repeat(60));
          console.log(`  🆔 ID: ${roleBase.id}`);
          console.log(`  👤 Nome: "${roleBase.name}"`);
          console.log(`  🧬 Raça: ${roleBase.race}`);
          console.log(`  ⚔️  Classe: ${roleBase.cls}`);
          console.log(`  ⚥  Gênero: ${roleBase.gender === 0 ? 'Masculino' : 'Feminino'}`);
          console.log(`  👥 User ID: ${roleBase.userid}`);
          
          if (roleBase.status !== undefined) {
            const statusText = ['Normal', 'Aguardando Deleção', 'Deletado'][roleBase.status] || 'Desconhecido';
            console.log(`  📊 Status: ${roleBase.status} (${statusText})`);
          }
          
          if (roleBase.create_time) {
            const createDate = new Date(roleBase.create_time * 1000);
            console.log(`  📅 Criado em: ${createDate.toLocaleString('pt-BR')}`);
          }
          
          if (roleBase.lastlogin_time) {
            const lastLogin = new Date(roleBase.lastlogin_time * 1000);
            console.log(`  ⏰ Último login: ${lastLogin.toLocaleString('pt-BR')}`);
          }
          
          if (roleBase.spouse && roleBase.spouse > 0) {
            console.log(`  💑 Cônjuge: ${roleBase.spouse}`);
          }
          
          // Status detalhado
          const roleData = result.getRoleData();
          if (roleData?.status) {
            console.log('\n📈 Status do Personagem:');
            console.log('─'.repeat(60));
            
            if (roleData.status.level !== undefined) {
              console.log(`  📊 Level: ${roleData.status.level}`);
            }
            
            if (roleData.status.exp !== undefined) {
              console.log(`  ✨ EXP: ${roleData.status.exp.toLocaleString()}`);
            }
            
            if (roleData.status.hp !== undefined && roleData.status.mp !== undefined) {
              console.log(`  ❤️  HP: ${roleData.status.hp.toLocaleString()}`);
              console.log(`  💙 MP: ${roleData.status.mp.toLocaleString()}`);
            }
            
            if (roleData.status.posx !== undefined) {
              console.log(`  📍 Posição: (${roleData.status.posx.toFixed(2)}, ${roleData.status.posy?.toFixed(2)}, ${roleData.status.posz?.toFixed(2)})`);
            }
            
            if (roleData.status.worldtag !== undefined) {
              console.log(`  🗺️  Mapa: ${roleData.status.worldtag}`);
            }
          }
          
          // Verificações de ban
          if (roleBase.forbid && roleBase.forbid.length > 0) {
            console.log('\n⚠️  Punições Ativas:');
            console.log('─'.repeat(60));
            roleBase.forbid.forEach((ban, index) => {
              const typeText = ['Ban de Role', 'Ban de Chat', 'Ban Tipo 2', 'Ban Tipo 3'][ban.type] || `Tipo ${ban.type}`;
              console.log(`  ${index + 1}. ${typeText}`);
              console.log(`     Duração: ${ban.time}s`);
              if (ban.reason && ban.reason.length > 0) {
                console.log(`     Razão: ${ban.reason.toString('utf16le')}`);
              }
            });
          }
          
          console.log('\n' + '✓'.repeat(60));
        }
      } else if (retcode === 0x7FFFFFFF || retcode === -1) {
        console.log('  ❌ Personagem não encontrado');
      } else {
        console.log(`  ⚠️  Erro desconhecido: ${retcode}`);
      }

    } catch (error: any) {
      console.error(`  ❌ Erro ao consultar role ${roleId}:`, error.message);
    }
    
    // Aguarda um pouco entre requisições
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n' + '='.repeat(60));
  console.log('Teste concluído!');
  console.log('='.repeat(60));
  
  client.disconnect();
}

// Executa o teste
if (require.main === module) {
  main().catch(console.error);
}


