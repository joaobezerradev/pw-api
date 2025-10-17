import { describe, it, expect } from 'vitest';
import { RenameRole } from './index';
import { GetRoleBase } from '../get-role-base';

const config = {
  host: '127.0.0.1',
  port: 29400,
};

const TEST_ROLE_ID = 1073;

describe('RenameRole - Teste de Integração', () => {
  it('deve renomear personagem com sucesso', async () => {
    // Primeiro, obtém o nome atual
    const getBase = await GetRoleBase.fetch(config.host, config.port, { roleId: TEST_ROLE_ID });
    expect(getBase.retcode).toBe(0);
    const currentName = getBase.base?.name || 'Unknown';

    // Define novo nome temporário
    const tempName = `Test_${Date.now() % 10000}`;

    // Renomeia
    const rename1 = await RenameRole.fetch(config.host, config.port, {
      roleId: TEST_ROLE_ID,
      oldName: currentName,
      newName: tempName,
    });

    expect(rename1.retcode).toBe(0);
    console.log(`✓ Renomeado de "${currentName}" para "${tempName}"`);

    // Verifica se realmente mudou
    const verify1 = await GetRoleBase.fetch(config.host, config.port, { roleId: TEST_ROLE_ID });
    expect(verify1.retcode).toBe(0);
    expect(verify1.base?.name).toBe(tempName);

    // Reverte para o nome original
    const rename2 = await RenameRole.fetch(config.host, config.port, {
      roleId: TEST_ROLE_ID,
      oldName: tempName,
      newName: currentName,
    });

    expect(rename2.retcode).toBe(0);
    console.log(`✓ Revertido de "${tempName}" para "${currentName}"`);

    // Verifica se voltou ao original
    const verify2 = await GetRoleBase.fetch(config.host, config.port, { roleId: TEST_ROLE_ID });
    expect(verify2.retcode).toBe(0);
    expect(verify2.base?.name).toBe(currentName);
  }, 60000);

  it('deve falhar ao renomear com nome antigo incorreto', async () => {
    const result = await RenameRole.fetch(config.host, config.port, {
      roleId: TEST_ROLE_ID,
      oldName: 'NomeInexistente',
      newName: 'NovoNome',
    });

    // Deve retornar erro (retcode != 0)
    expect(result.retcode).not.toBe(0);
  }, 30000);

  it('deve validar retcode para roleId inválido', async () => {
    const result = await RenameRole.fetch(config.host, config.port, {
      roleId: 999999, // Role inexistente
      oldName: 'Qualquer',
      newName: 'Teste',
    });

    expect(result.retcode).toBeTypeOf('number');
  }, 30000);
});

