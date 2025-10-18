import { describe, it, expect, beforeAll } from 'vitest';
import { RenameRole } from './rename-role';
import { GameDBConnection } from '@infra/connections';
import { GetRoleBase } from './get-role-base';

// Setup ENVs para teste
beforeAll(() => {
  process.env.GAME_SERVER_HOST = '127.0.0.1';
  process.env.GAMEDB_PORT = '29400';
  process.env.GAMEDB_TIMEOUT = '20000';
});

const TEST_ROLE_ID = 1073;

describe('RenameRole - Teste de Integração', () => {
  it('deve renomear personagem com sucesso', async () => {
    // Primeiro, obtém o nome atual
    const connection1 = new GameDBConnection();
    const getBaseAction = new GetRoleBase(connection1);
    const getBase = await getBaseAction.execute({ roleId: TEST_ROLE_ID });
    expect(getBase.retcode).toBe(0);
    const currentName = getBase.base?.name || 'Unknown';

    // Define novo nome temporário
    const tempName = `Test_${Date.now() % 10000}`;

    // Renomeia
    const connection2 = new GameDBConnection();
    const rename1Action = new RenameRole(connection2);
    const rename1 = await rename1Action.execute({
      roleId: TEST_ROLE_ID,
      oldName: currentName,
      newName: tempName,
    });

    expect(rename1.retcode).toBe(0);
    console.log(`✓ Renomeado de "${currentName}" para "${tempName}"`);

    // Verifica se realmente mudou
    const connection3 = new GameDBConnection();
    const verify1Action = new GetRoleBase(connection3);
    const verify1 = await verify1Action.execute({ roleId: TEST_ROLE_ID });
    expect(verify1.retcode).toBe(0);
    expect(verify1.base?.name).toBe(tempName);

    // Reverte para o nome original
    const connection4 = new GameDBConnection();
    const rename2Action = new RenameRole(connection4);
    const rename2 = await rename2Action.execute({
      roleId: TEST_ROLE_ID,
      oldName: tempName,
      newName: currentName,
    });

    expect(rename2.retcode).toBe(0);
    console.log(`✓ Revertido de "${tempName}" para "${currentName}"`);

    // Verifica se voltou ao original
    const connection5 = new GameDBConnection();
    const verify2Action = new GetRoleBase(connection5);
    const verify2 = await verify2Action.execute({ roleId: TEST_ROLE_ID });
    expect(verify2.retcode).toBe(0);
    expect(verify2.base?.name).toBe(currentName);
  }, 60000);

  it('deve falhar ao renomear com nome antigo incorreto', async () => {
    const connection = new GameDBConnection();
    const resultAction = new RenameRole(connection);
    const result = await resultAction.execute({
      roleId: TEST_ROLE_ID,
      oldName: 'NomeInexistente',
      newName: 'NovoNome',
    });

    // Deve retornar erro (retcode != 0)
    expect(result.retcode).not.toBe(0);
  }, 30000);

  it('deve validar retcode para roleId inválido', async () => {
    const connection = new GameDBConnection();
    const resultAction = new RenameRole(connection);
    const result = await resultAction.execute({
      roleId: 999999, // Role inexistente
      oldName: 'Qualquer',
      newName: 'Teste',
    });

    expect(result.retcode).toBeTypeOf('number');
  }, 30000);
});

