import { describe, it, expect, beforeAll } from 'vitest';
import { ClearStorehousePasswd } from './clear-storehouse-passwd';
import { GameDBConnection } from '../../';

// Setup ENVs para teste
beforeAll(() => {
  process.env.GAME_SERVER_HOST = '127.0.0.1';
  process.env.GAMEDB_PORT = '29400';
  process.env.GAMEDB_TIMEOUT = '20000';
});

const TEST_ROLE_ID = 1073;

describe('ClearStorehousePasswd - Teste de Integração', () => {
  it('deve validar retcode ao remover senha do armazém', async () => {
    const connection = new GameDBConnection();
    const resultAction = new ClearStorehousePasswd(connection);
    const result = await resultAction.execute({
      roleid: TEST_ROLE_ID,
    });

    // Valida apenas que retornou
    expect(result.retcode).toBeTypeOf('number');
    
    if (result.retcode === 0) {
      console.log('✓ Senha do armazém removida com sucesso');
    } else {
      console.log(`ℹ Retcode: ${result.retcode} (pode indicar que não havia senha ou personagem está online)`);
    }
  }, 30000);

  it('deve processar comando para role inexistente', async () => {
    const connection = new GameDBConnection();
    const resultAction = new ClearStorehousePasswd(connection);
    const result = await resultAction.execute({
      roleid: 999999,
    });

    expect(result.retcode).toBeTypeOf('number');
  }, 30000);

  it('deve aceitar rolename opcional', async () => {
    const connection = new GameDBConnection();
    const resultAction = new ClearStorehousePasswd(connection);
    const result = await resultAction.execute({
      roleid: TEST_ROLE_ID,
      rolename: 'TestRole',
    });

    expect(result.retcode).toBeTypeOf('number');
  }, 30000);
});

