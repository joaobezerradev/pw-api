/**
 * Exemplo - Comandos GM (Game Master)
 */
import { GameConnection, LogLevel } from '../src';
import { ForbidUser } from '../src/actions/forbid-user';
import { GMBanRole } from '../src/protocols/gm-ban-role';
import { GMMuteRole } from '../src/protocols/gm-mute-role';

const config = {
  host: '127.0.0.1',
  port: 29400,  // GAMEDBD para banAccount
};

async function exemploComandosGM() {
  console.log('=== Exemplo: Comandos GM ===\n');
  
  const connection = new GameConnection(config.host, config.port, LogLevel.INFO);
  
  try {
    // 1. Ban de Conta
    console.log('📋 1. Ban de Conta (ForbidUser)');
    console.log('─'.repeat(50));
    
    const banRpc = await connection.call(new ForbidUser({
      operation: 1,      // 1 = forbid (ban)
      userid: 1090,      // ID da conta
      time: 3600,        // 1 hora em segundos
      reason: 'Teste de ban via API',
    }));
    
    console.log('Retcode:', banRpc.output.retcode);
    if (banRpc.output.retcode === 0) {
      console.log('✅ Conta banida com sucesso!');
      if (banRpc.output.forbid) {
        console.log('Detalhes:', banRpc.output.forbid);
      }
    } else {
      console.log('❌ Erro ao banir conta');
    }
    
    // 2. Consultar Ban
    console.log('\n📋 2. Consultar Status de Ban');
    console.log('─'.repeat(50));
    
    const queryRpc = await connection.call(new ForbidUser({
      operation: 0,      // 0 = query (consultar)
      userid: 1090,
      time: 0,
      reason: '',
    }));
    
    console.log('Retcode:', queryRpc.output.retcode);
    if (queryRpc.output.retcode === 0 && queryRpc.output.forbid) {
      console.log('✅ Status:', queryRpc.output.forbid);
    }
    
    // 3. Remover Ban (Unban)
    console.log('\n📋 3. Remover Ban (Unban)');
    console.log('─'.repeat(50));
    
    const unbanRpc = await connection.call(new ForbidUser({
      operation: 2,      // 2 = unforbid (unban)
      userid: 1090,
      time: 0,
      reason: 'Ban removido via API',
    }));
    
    console.log('Retcode:', unbanRpc.output.retcode);
    if (unbanRpc.output.retcode === 0) {
      console.log('✅ Ban removido com sucesso!');
    }
    
  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
  }
  
  // Exemplos de GMBanRole e GMMuteRole (porta 29100)
  console.log('\n\n=== Comandos GM - Personagens (Protocols) ===\n');
  
  try {
    // 4. Ban de Personagem (GMBanRole)
    console.log('📋 4. Ban de Personagem (GMBanRole)');
    console.log('─'.repeat(50));
    console.log('⚠️  Nota: Este é um Protocol (fire and forget)');
    console.log('   O servidor não envia resposta de confirmação.\n');
    
    await GMBanRole.send('127.0.0.1', 29100, {
      roleId: 1073,      // ID do personagem
      time: 600,         // 10 minutos em segundos
      reason: 'Teste de ban de personagem',
    });
    
    console.log('✅ Comando GMBanRole enviado com sucesso!');
    console.log('   RoleId: 1073');
    console.log('   Tempo: 600 segundos (10 minutos)');
    console.log('   Motivo: Teste de ban de personagem');
    
    // 5. Mute de Personagem (GMMuteRole)
    console.log('\n📋 5. Mute de Personagem (GMMuteRole)');
    console.log('─'.repeat(50));
    console.log('⚠️  Nota: Este é um Protocol (fire and forget)');
    console.log('   O servidor não envia resposta de confirmação.\n');
    
    await GMMuteRole.send('127.0.0.1', 29100, {
      roleId: 1073,      // ID do personagem
      time: 300,         // 5 minutos em segundos
      reason: 'Teste de mute de personagem',
    });
    
    console.log('✅ Comando GMMuteRole enviado com sucesso!');
    console.log('   RoleId: 1073');
    console.log('   Tempo: 300 segundos (5 minutos)');
    console.log('   Motivo: Teste de mute de personagem');
    
    // 6. Remover Ban de Personagem (Unban)
    console.log('\n📋 6. Remover Ban de Personagem (Unban)');
    console.log('─'.repeat(50));
    console.log('⚠️  Nota: Envia GMBanRole com time=0 para remover ban\n');
    
    await GMBanRole.unban('127.0.0.1', 29100, {
      roleId: 1073,
      reason: 'Ban removido - teste concluído',
    });
    
    console.log('✅ Comando Unban enviado com sucesso!');
    console.log('   RoleId: 1073');
    console.log('   O personagem foi desbanido');
    
    // 7. Remover Mute de Personagem (Unmute)
    console.log('\n📋 7. Remover Mute de Personagem (Unmute)');
    console.log('─'.repeat(50));
    console.log('⚠️  Nota: Envia GMMuteRole com time=0 para remover mute\n');
    
    await GMMuteRole.unmute('127.0.0.1', 29100, {
      roleId: 1073,
      reason: 'Mute removido - teste concluído',
    });
    
    console.log('✅ Comando Unmute enviado com sucesso!');
    console.log('   RoleId: 1073');
    console.log('   O personagem foi desmutado');
    
    console.log('\n' + '═'.repeat(50));
    console.log('💡 Diferenças entre RPC e Protocol:');
    console.log('═'.repeat(50));
    console.log('RPC (ForbidUser):');
    console.log('  ✅ Retorna resposta com retcode');
    console.log('  ✅ Permite consultar status');
    console.log('  ✅ Confirmação do servidor');
    console.log('\nProtocol (GMBanRole/GMMuteRole):');
    console.log('  ⚠️  Não retorna resposta');
    console.log('  ⚠️  Fire and forget');
    console.log('  ⚠️  Sem confirmação direta');
    
  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
  }
}

exemploComandosGM();

