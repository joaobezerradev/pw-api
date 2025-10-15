import { GameConnection, SendMail, LogLevel } from '../src';

(async () => {
  const connection = new GameConnection('127.0.0.1', 29100, LogLevel.INFO);

  console.log('=== Exemplo: Enviar Email do Sistema (SysSendMail) ===\n');

  try {
    // Envia email simples (sem item)
    console.log('📧 Enviando email...');
    const tid = Math.floor(Date.now() / 1000) & 0xFFFFFFFF;
    
    const result = await connection.call(new SendMail({
      tid,
      sysid: 32,
      sys_type: 3,
      receiver: 1073,
      title: 'Bem-vindo ao Servidor!',
      context: 'Obrigado por jogar. Aqui está um presente para você!',
      attach_obj: {
        id: 0,            // 0 = sem item
        pos: 0,
        count: 0,
        max_count: 0,
        data: Buffer.alloc(0),
        proctype: 0,
        expire_date: 0,
        guid1: 0,
        guid2: 0,
        mask: 0,
      },
      attach_money: 10000, // 10.000 gold
    }));

    console.log(`Resposta recebida:`);
    console.log(`  Retcode: ${result.output.retcode} (0x${result.output.retcode.toString(16).toUpperCase()})`);
    console.log(`  TID: ${result.output.tid}`);

    if (result.output.retcode === 0) {
      console.log('✅ Email enviado com sucesso!');
    } else {
      console.log(`⚠️  Erro ao enviar email`);
    }

    // Envia email com item (ID 4874)
    console.log('\n📦 Enviando email com item...');
    const tid2 = (Math.floor(Date.now() / 1000) & 0xFFFFFFFF) + 1;
    
    const result2 = await connection.call(new SendMail({
      tid: tid2,
      sysid: 32,
      sys_type: 3,
      receiver: 1073,
      title: 'Item Especial',
      context: 'Você recebeu um item especial!',
      attach_obj: {
        id: 4874,         // Item ID 4874
        pos: 0,
        count: 1,         // Quantidade
        max_count: 1,
        data: Buffer.alloc(0),
        proctype: 0,
        expire_date: 0,
        guid1: 0,
        guid2: 0,
        mask: 0,
      },
      attach_money: 0,
    }));

    console.log(`Resposta recebida:`);
    console.log(`  Retcode: ${result2.output.retcode} (0x${result2.output.retcode.toString(16).toUpperCase()})`);
    console.log(`  TID: ${result2.output.tid}`);

    if (result2.output.retcode === 0) {
      console.log('✅ Email com item enviado!');
    } else {
      console.log(`⚠️  Erro ao enviar email com item`);
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
})();
