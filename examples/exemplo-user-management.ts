/**
 * Exemplo - Gerenciamento de Usuário (Completo)
 * Demonstra o uso de GetUserRoles e ClearStorehousePasswd juntos
 */
import { GameConnection, LogLevel, GetUserRoles, ClearStorehousePasswd, RenameRole } from '../src';

const config = {
  host: '127.0.0.1',
  port: 29400,  // GAMEDBD
};

async function exemploUserManagement() {
  console.log('=== Exemplo: Gerenciamento de Usuário ===\n');
  
  const connection = new GameConnection(config.host, config.port, LogLevel.INFO);
  
  const userid = 16;
  
  try {
    // 1. Listar personagens da conta
    console.log('📋 1. Listando Personagens da Conta');
    console.log('─'.repeat(50));
    
    const rolesRpc = await connection.call(new GetUserRoles({ userid }));
    
    if (rolesRpc.output.retcode === 0) {
      console.log(`✅ Total de personagens: ${rolesRpc.output.count}\n`);
      
      rolesRpc.output.roles.forEach((role, index) => {
        console.log(`${index + 1}. ${role.rolename}`);
        console.log(`   RoleID: ${role.roleid}`);
      });
    } else {
      console.log('❌ Erro ao buscar personagens');
      return;
    }
    
    // 2. Remover lock do armazém (usando o primeiro personagem)
    console.log('\n📋 2. Removendo Lock do Armazém');
    console.log('─'.repeat(50));
    console.log('⚠️  IMPORTANTE: Personagem PRECISA estar OFFLINE!\n');
    
    let clearLockRpc;
    if (rolesRpc.output.count > 0) {
      const firstRole = rolesRpc.output.roles[0];
      console.log(`Usando RoleID: ${firstRole.roleid} (${firstRole.rolename})`);
      clearLockRpc = await connection.call(new ClearStorehousePasswd({ 
        roleid: firstRole.roleid 
      }));
    } else {
      console.log('⚠️  Nenhum personagem encontrado para remover lock\n');
      return;
    }
    
    if (clearLockRpc.output.retcode === 0) {
      console.log('✅ Lock do armazém removido com sucesso!');
      console.log('   O jogador pode acessar o armazém sem senha.');
    } else {
      console.log('❌ Erro ao remover lock');
    }
    
    // 3. Exemplo opcional: Renomear primeiro personagem (se existir)
    if (rolesRpc.output.count > 0) {
      const firstRole = rolesRpc.output.roles[0];
      
      console.log('\n📋 3. Exemplo: Renomear Personagem (Opcional)');
      console.log('─'.repeat(50));
      console.log(`Personagem: ${firstRole.rolename} (ID: ${firstRole.roleid})`);
      console.log('Descomente o código abaixo para testar rename:\n');
      
      console.log('```typescript');
      console.log('const renameRpc = await connection.call(new RenameRole({');
      console.log(`  roleId: ${firstRole.roleid},`);
      console.log(`  oldName: '${firstRole.rolename}',`);
      console.log(`  newName: 'NovoNome',`);
      console.log('}));');
      console.log('```');
    }
    
    // Resumo
    console.log('\n' + '═'.repeat(50));
    console.log('✅ Operações Concluídas:');
    console.log('═'.repeat(50));
    console.log(`• Personagens listados: ${rolesRpc.output.count}`);
    console.log('• Lock do armazém: Removido');
    console.log('\n💡 Casos de Uso:');
    console.log('• Recuperação de conta');
    console.log('• Suporte ao jogador');
    console.log('• Administração de personagens');
    console.log('• Reset de senha do armazém');
    
  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
  }
}

exemploUserManagement();

