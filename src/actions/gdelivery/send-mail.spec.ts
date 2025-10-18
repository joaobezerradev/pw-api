import { describe, it, expect, beforeAll } from 'vitest';
import { SendMail, GDeliveryConnection } from '../../';

// Setup ENVs para teste
beforeAll(() => {
  process.env.GAME_SERVER_HOST = '127.0.0.1';
  process.env.GDELIVERY_PORT = '29100';
  process.env.GDELIVERY_TIMEOUT = '20000';
});

const TEST_RECEIVER_ID = 1073; // Role ID para testes

describe('SendMail - Teste de Integração (SysSendMail)', () => {
  it('deve enviar email com sucesso', async () => {
    const tid = Math.floor(Date.now() / 1000) & 0xFFFFFFFF;

    const connection = new GDeliveryConnection();
    const resultAction = new SendMail(connection);
    const result = await resultAction.execute({
      tid,
      sysid: 32,
      sys_type: 3,
      receiver: TEST_RECEIVER_ID,
      title: 'Email de Teste',
      context: 'Este é um email de teste do sistema',
      attach_obj: {
        id: 0,              // Sem item
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
      attach_money: 10000,
    });

    expect(result.retcode).toBe(0);
  }, 30000);

  it('deve enviar email com item anexado', async () => {
    const tid = Math.floor(Date.now() / 1000) & 0xFFFFFFFF;

    const connection = new GDeliveryConnection();
    const resultAction = new SendMail(connection);
    const result = await resultAction.execute({
      tid,
      sysid: 32,
      sys_type: 3,
      receiver: TEST_RECEIVER_ID,
      title: 'Email com Item',
      context: 'Este email contém um item anexado',
      attach_obj: {
        id: 4874,           // Item ID 4874
        pos: 0,
        count: 1,
        max_count: 1,
        data: Buffer.alloc(0),
        proctype: 0,
        expire_date: 0,
        guid1: 0,
        guid2: 0,
        mask: 0,
      },
      attach_money: 5000,
    });

    expect(result.retcode).toBe(0);
  }, 30000);
});
