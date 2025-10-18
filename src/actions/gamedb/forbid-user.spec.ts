import { describe, it, expect, beforeAll } from 'vitest';
import { ForbidUser } from './forbid-user';
import { GameDBConnection } from '../../';

// Setup ENVs para teste
beforeAll(() => {
  process.env.GAME_SERVER_HOST = '127.0.0.1';
  process.env.GAMEDB_PORT = '29400';
  process.env.GAMEDB_TIMEOUT = '20000';
});

const TEST_USER_ID = 1090;

describe('ForbidUser - Teste de Integração', () => {
  it('deve banir conta temporariamente', async () => {
    const connection = new GameDBConnection();
    const resultAction = new ForbidUser(connection);
    const result = await resultAction.execute({
      operation: 1, // Add forbid
      userid: TEST_USER_ID,
      time: 60, // 1 minuto
      reason: 'Teste de ban',
    });

    expect(result.retcode).toBe(0);
    
    if (result.forbid) {
      expect(result.forbid.type).toBeTypeOf('number');
      expect(result.forbid.time).toBeTypeOf('number');
      expect(result.forbid.createtime).toBeTypeOf('number');
      expect(result.forbid.reason).toBeTypeOf('string');
      console.log(`✓ Conta banida: ${JSON.stringify(result.forbid)}`);
    }
  }, 30000);

  it('deve remover ban da conta', async () => {
    const connection = new GameDBConnection();
    const resultAction = new ForbidUser(connection);
    const result = await resultAction.execute({
      operation: 0, // Remove forbid
      userid: TEST_USER_ID,
      time: 0,
      reason: 'Ban removido - teste',
    });

    expect(result.retcode).toBe(0);
    console.log('✓ Ban removido da conta');
  }, 30000);

  it('deve processar operação com parâmetros completos', async () => {
    const connection = new GameDBConnection();
    const resultAction = new ForbidUser(connection);
    const result = await resultAction.execute({
      operation: 1,
      userid: TEST_USER_ID,
      time: 120,
      reason: 'Teste completo',
      gmuserid: 32,
      source: 1,
    });

    expect(result.retcode).toBeTypeOf('number');
    
    // Remove o ban para cleanup
    await new ForbidUser(new GameDBConnection()).execute({
      operation: 0,
      userid: TEST_USER_ID,
      time: 0,
      reason: 'Cleanup',
    });
  }, 30000);

  it('deve validar retcode para usuário inválido', async () => {
    const connection = new GameDBConnection();
    const resultAction = new ForbidUser(connection);
    const result = await resultAction.execute({
      operation: 1,
      userid: 999999,
      time: 60,
      reason: 'Teste usuário inexistente',
    });

    expect(result.retcode).toBeTypeOf('number');
  }, 30000);
});

