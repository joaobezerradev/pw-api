/**
 * Exemplo - Broadcast de Mensagens (ChatBroadcast)
 */
import { ChatBroadcast, ChatChannel } from '../src';

const config = {
  host: '127.0.0.1',
  port: 29300,  // GPROVIDER
};

async function exemploBroadcast() {
  console.log('=== Exemplo: Broadcast de Mensagens ===\n');
  
  try {
    // 1. Mensagem de Sistema
    console.log('📢 1. Enviando Mensagem de Sistema');
    console.log('─'.repeat(50));
    console.log('Canal: SYSTEM (12)');
    console.log('Mensagem: Servidor reiniciará em 10 minutos!\n');
    
    await ChatBroadcast.sendSystem(config.host, config.port, {
      message: 'Servidor reiniciará em 10 minutos!',
    });
    
    console.log('✅ Mensagem de sistema enviada!');
    
    // 2. Mensagem Mundial (World Chat)
    console.log('\n📢 2. Enviando Mensagem Mundial');
    console.log('─'.repeat(50));
    console.log('Canal: WORLD (9)');
    console.log('Mensagem: Bem-vindos ao servidor!\n');
    
    await ChatBroadcast.sendWorld(config.host, config.port, {
      message: 'Bem-vindos ao servidor!',
      srcRoleId: 0,  // 0 = mensagem do sistema
    });
    
    console.log('✅ Mensagem mundial enviada!');
    
    // 3. Mensagem via Horn/Megafone
    console.log('\n📢 3. Enviando via Horn/Megafone');
    console.log('─'.repeat(50));
    console.log('Canal: HORN (13)');
    console.log('RoleID: 1073');
    console.log('Mensagem: Evento especial começou!\n');
    
    await ChatBroadcast.sendHorn(config.host, config.port, {
      message: 'Evento especial começou!',
      srcRoleId: 1073,
    });
    
    console.log('✅ Mensagem via horn enviada!');
    
    // 4. Mensagem Customizada (canal específico)
    console.log('\n📢 4. Mensagem Customizada');
    console.log('─'.repeat(50));
    console.log('Canal: WORLD (9)');
    console.log('Mensagem: Manutenção programada para 22h\n');
    
    await ChatBroadcast.send(config.host, config.port, {
      channel: ChatChannel.WORLD,
      srcRoleId: 0,
      message: 'Manutenção programada para 22h',
      emotion: 0,
    });
    
    console.log('✅ Mensagem customizada enviada!');
    
    // Resumo
    console.log('\n' + '═'.repeat(50));
    console.log('💡 Informações:');
    console.log('═'.repeat(50));
    console.log('• Protocol Type: 120 (0x78)');
    console.log('• Porta: 29300 (GPROVIDER)');
    console.log('• Fire and Forget: Não retorna resposta');
    console.log('• Visível: Para todos os jogadores online');
    console.log('\n📋 Canais disponíveis:');
    console.log(`• WORLD (${ChatChannel.WORLD}): Chat mundial`);
    console.log(`• SYSTEM (${ChatChannel.SYSTEM}): Mensagens de sistema`);
    console.log(`• HORN (${ChatChannel.HORN}): Horn/Megafone`);
    console.log('\n💡 srcRoleId = 0: Mensagem aparece como sistema');
    console.log('💡 srcRoleId > 0: Mensagem aparece em nome do personagem');
    
  } catch (error: any) {
    console.error('\n❌ Erro:', error.message);
  }
}

exemploBroadcast();

