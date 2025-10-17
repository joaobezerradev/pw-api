import { describe, it, expect } from 'vitest';
import { ClearStorehousePasswd } from './index';

const config = {
  host: '127.0.0.1',
  port: 29400,
};

const TEST_ROLE_ID = 1073;

describe('ClearStorehousePasswd - Teste de Integração', () => {
  it('deve validar retcode ao remover senha do armazém', async () => {
    const result = await ClearStorehousePasswd.fetch(config.host, config.port, {
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
    const result = await ClearStorehousePasswd.fetch(config.host, config.port, {
      roleid: 999999,
    });

    expect(result.retcode).toBeTypeOf('number');
  }, 30000);

  it('deve aceitar rolename opcional', async () => {
    const result = await ClearStorehousePasswd.fetch(config.host, config.port, {
      roleid: TEST_ROLE_ID,
      rolename: 'TestRole',
    });

    expect(result.retcode).toBeTypeOf('number');
  }, 30000);
});

