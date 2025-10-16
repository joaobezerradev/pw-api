/**
 * Exemplo - Renomear Personagem (RenameRole)
 */
import { GameConnection, LogLevel, RenameRole } from '../src';

const config = {
  host: '127.0.0.1',
  port: 29400,  // GAMEDBD
};

async function exemploRenameRole() {
  console.log('=== Exemplo: Renomear Personagem ===\n');
  
  const connection = new GameConnection(config.host, config.port, LogLevel.INFO);
  
  try {
    // Renomear personagem
    console.log('📋 Renomeando Personagem');
    console.log('─'.repeat(50));
    console.log('RoleID: 1073');
    console.log('Nome Antigo: NomeAntigo');
    console.log('Nome Novo: NovoNome\n');
    
    const rpc = await connection.call(new RenameRole({
      roleId: 1073,
      oldName: 'JJJ',
      newName: 'NovoNome',
    }));
    
    console.log('Retcode:', rpc.output.retcode);
    
    if (rpc.output.retcode === 0) {
      console.log('✅ Personagem renomeado com sucesso!');
    } else {
      console.log('❌ Erro ao renomear personagem');
      console.log('   Retcode:', rpc.output.retcode);
      
      // Códigos de erro comuns
      console.log('\n📝 Códigos de erro:');
      console.log('   0: Sucesso - personagem renomeado');
      console.log('   1: Personagem não encontrado');
      console.log('   2: Nome antigo incorreto');
      console.log('   3: Nome novo já existe');
      console.log('   4: Nome novo inválido (caracteres especiais, tamanho, etc)');
      console.log('   5: Personagem está online (precisa estar offline)');
      console.log('   6: Nome em uso ou reservado');
      console.log('   7: Operação não permitida');
    }
    
    console.log('\n' + '═'.repeat(50));
    console.log('💡 Informações:');
    console.log('═'.repeat(50));
    console.log('• RPC Type: 3404 (0xD4C)');
    console.log('• Porta: 29400 (GAMEDBD)');
    console.log('• Retorna: retcode (0 = sucesso)');
    console.log('• Requer: roleId, oldName, newName');
    
  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
  }
}

exemploRenameRole();

