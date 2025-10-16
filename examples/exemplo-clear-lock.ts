/**
 * Exemplo - Remover Lock do Armazém (ClearStorehousePasswd)
 */
import { GameConnection, LogLevel, ClearStorehousePasswd } from '../src';

const config = {
  host: '127.0.0.1',
  port: 29400,  // GAMEDBD
};

async function exemploClearLock() {
  console.log('=== Exemplo: Remover Lock do Armazém ===\n');
  
  const connection = new GameConnection(config.host, config.port, LogLevel.INFO);
  
  try {
    // Remover lock do personagem
    console.log('📋 Removendo Lock do Armazém');
    console.log('─'.repeat(50));
    console.log('RoleID: 1073');
    console.log('⚠️  IMPORTANTE: Personagem PRECISA estar OFFLINE!\n');
    
    const rpc = await connection.call(new ClearStorehousePasswd({
      roleid: 1073,
    }));
    
    console.log('Retcode:', rpc.output.retcode);
    
    if (rpc.output.retcode === 0) {
      console.log('✅ Lock removido com sucesso!');
      console.log('   O jogador pode acessar o armazém sem senha.');
    } else {
      console.log('❌ Erro ao remover lock');
      console.log('   Retcode:', rpc.output.retcode);
      
      // Códigos de erro comuns
      console.log('\n📝 Códigos de erro:');
      console.log('   0: Sucesso - lock removido');
      console.log('   -1: Conta não encontrada');
      console.log('   -2: Erro no banco de dados');
      console.log('   -3: Operação não permitida');
    }
    
    console.log('\n' + '═'.repeat(50));
    console.log('💡 Informações:');
    console.log('═'.repeat(50));
    console.log('• RPC Type: 3402 (0xD4A)');
    console.log('• Porta: 29400 (GAMEDBD)');
    console.log('• Nome Original: ClearStorehousePasswd');
    console.log('• Também conhecido como: RemoveLock');
    console.log('• Retorna: retcode (0 = sucesso)');
    console.log('• Requer: roleid, rolename (opcional)');
    console.log('\n💡 O que faz:');
    console.log('• Remove a senha do armazém (storehouse)');
    console.log('• Útil quando o jogador esquece a senha');
    console.log('• Após remover, o jogador pode acessar sem senha');
    console.log('\n⚠️  REQUISITOS IMPORTANTES:');
    console.log('• O personagem PRECISA estar OFFLINE/deslogado');
    console.log('• Se o personagem estiver online, o comando não funciona');
    console.log('• Após executar, o jogador pode relogar normalmente');
    
  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
  }
}

exemploClearLock();

