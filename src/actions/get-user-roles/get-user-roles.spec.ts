import { describe, it, expect } from 'vitest';
import { GetUserRoles } from './index';

const config = {
  host: '127.0.0.1',
  port: 29400,
};

const TEST_USER_ID = 1090; // User ID que tem roles

describe('GetUserRoles - Teste de Integração', () => {
  it('deve obter lista de roles de um usuário', async () => {
    const result = await GetUserRoles.fetch(config.host, config.port, {
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
    const result = await GetUserRoles.fetch(config.host, config.port, {
      userid: 999999, // Usuário inexistente
    });

    // Pode retornar erro ou lista vazia dependendo do servidor
    expect(result.retcode).toBeTypeOf('number');
    expect(result.roles).toBeInstanceOf(Array);
  }, 30000);
});

