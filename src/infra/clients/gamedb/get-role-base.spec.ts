import { describe, it, expect, beforeAll } from 'vitest';
import { GameDBConnection } from '@infra/connections';
import { GetRoleBase } from '@infra/clients';

// Setup ENVs para teste
beforeAll(() => {
  process.env.GAME_SERVER_HOST = '127.0.0.1';
  process.env.GAMEDB_PORT = '29400';
  process.env.GAMEDB_TIMEOUT = '20000';
});

const TEST_ROLE_ID = 1073;

describe('GetRoleBase - Teste de Integração', () => {
  it('deve obter dados básicos do personagem com sucesso', async () => {
    // Cria conexão e action com DI
    const connection = new GameDBConnection();
    const getRoleBase = new GetRoleBase(connection);
    
    try {
      const result = await getRoleBase.execute({ roleId: TEST_ROLE_ID });
      
      // Verifica retcode
      expect(result.retcode).toBe(0);
      
      // Verifica base
      expect(result.base).toBeDefined();
      expect(result.base?.id).toBe(TEST_ROLE_ID);
      expect(result.base?.name).toBe('NovoNome');
      expect(result.base?.race).toBeTypeOf('number');
      expect(result.base?.cls).toBeTypeOf('number');
      expect(result.base?.gender).toBeGreaterThanOrEqual(0);
      expect(result.base?.gender).toBeLessThanOrEqual(1);
      expect(result.base?.userid).toBe(1090);
      expect(result.base?.create_time).toBeGreaterThan(0);
      expect(result.base?.lastlogin_time).toBeGreaterThan(0);
      
    } finally {
    }
  });

  it('deve retornar erro para roleId inválido', async () => {
    // Cria conexão e action com DI
    const connection = new GameDBConnection();
    const getRoleBase = new GetRoleBase(connection);
    
    try {
      const result = await getRoleBase.execute({ roleId: 99999 });
      
      // Deve retornar retcode diferente de 0 (erro)
      expect(result.retcode).not.toBe(0);
      expect(result.base).toBeUndefined();
      
    } finally {
    }
  });
});

