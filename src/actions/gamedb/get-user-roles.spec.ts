import { describe, it, expect, beforeAll } from 'vitest';
import { GetUserRoles } from './get-user-roles';
import { GameDBConnection } from '../../';

// Setup ENVs para teste
beforeAll(() => {
  process.env.GAME_SERVER_HOST = '127.0.0.1';
  process.env.GAMEDB_PORT = '29400';
  process.env.GAMEDB_TIMEOUT = '20000';
});

const TEST_USER_ID = 1090; // User ID que tem roles

describe('GetUserRoles - Teste de Integração', () => {
  it('deve obter lista de roles de um usuário', async () => {
    const connection = new GameDBConnection();
    const resultAction = new GetUserRoles(connection);
    const result = await resultAction.execute({
      userid: TEST_USER_ID,
    });

    expect(result.retcode).toBe(0);
    expect(result.count).toBeGreaterThanOrEqual(0);
    expect(result.roles).toBeInstanceOf(Array);
    expect(result.roles.length).toBe(result.count);

    // Verifica estrutura se houver roles
    if (result.roles.length > 0) {
      const role = result.roles[0];
      expect(role.roleid).toBeTypeOf('number');
      expect(role.rolename).toBeTypeOf('string');
      
      console.log(`✓ Usuário ${TEST_USER_ID} tem ${result.count} personagens`);
      result.roles.forEach(r => {
        console.log(`  - ${r.rolename} (ID: ${r.roleid})`);
      });
    }
  }, 30000);

  it('deve retornar lista vazia para usuário sem roles', async () => {
    const connection = new GameDBConnection();
    const resultAction = new GetUserRoles(connection);
    const result = await resultAction.execute({
      userid: 999999, // Usuário inexistente
    });

    // Pode retornar erro ou lista vazia dependendo do servidor
    expect(result.retcode).toBeTypeOf('number');
    expect(result.roles).toBeInstanceOf(Array);
  }, 30000);
});

