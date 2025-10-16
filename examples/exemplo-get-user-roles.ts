/**
 * Exemplo - Listar Personagens de uma Conta (GetUserRoles)
 */
import { GameConnection, LogLevel, GetUserRoles } from '../src';

const config = {
  host: '127.0.0.1',
  port: 29400,  // GAMEDBD
};

async function exemploGetUserRoles() {
  console.log('=== Exemplo: Listar Personagens da Conta ===\n');
  
  const connection = new GameConnection(config.host, config.port, LogLevel.INFO);
  
  try {
    // Listar personagens da conta
    console.log('📋 Buscando Personagens');
    console.log('─'.repeat(50));
    console.log('UserID: 16\n');
    
    const rpc = await connection.call(new GetUserRoles({
      userid: 1090,
    }));
    
    console.log('Retcode:', rpc.output.retcode);
    
    if (rpc.output.retcode === 0) {
      console.log('✅ Personagens encontrados!\n');
      console.log(`Total de personagens: ${rpc.output.count}`);
      console.log('─'.repeat(50));
      
      if (rpc.output.count > 0) {
        rpc.output.roles.forEach((role, index) => {
          console.log(`${index + 1}. ${role.rolename}`);
          console.log(`   ID: ${role.roleid}`);
        });
      } else {
        console.log('Nenhum personagem encontrado nesta conta.');
      }
    } else {
      console.log('❌ Erro ao buscar personagens');
      console.log('   Retcode:', rpc.output.retcode);
      
      // Códigos de erro comuns
      console.log('\n📝 Códigos de erro:');
      console.log('   0: Sucesso');
      console.log('   -1: Conta não encontrada');
      console.log('   -2: Erro no banco de dados');
    }
    
    console.log('\n' + '═'.repeat(50));
    console.log('💡 Informações:');
    console.log('═'.repeat(50));
    console.log('• RPC Type: 3401 (0xD49)');
    console.log('• Porta: 29400 (GAMEDBD)');
    console.log('• Retorna: retcode, count, roles[]');
    console.log('• Requer: userid');
    
  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
  }
}

exemploGetUserRoles();

