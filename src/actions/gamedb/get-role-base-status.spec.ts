import { describe, it, expect, beforeAll } from 'vitest';
import { GetRoleBaseStatus } from './get-role-base-status';
import { GameDBConnection } from '../../';

// Setup ENVs para teste
beforeAll(() => {
  process.env.GAME_SERVER_HOST = '127.0.0.1';
  process.env.GAMEDB_PORT = '29400';
  process.env.GAMEDB_TIMEOUT = '20000';
});

const TEST_ROLE_ID = 1073;

describe('GetRoleBaseStatus - Teste de Integração', () => {
  it('deve obter base e status do personagem em uma chamada', async () => {
    // Using .fetch() method directly
    
    try {
      const connection = new GameDBConnection();
    const resultAction = new GetRoleBaseStatus(connection);
    const result = await resultAction.execute({ roleId: TEST_ROLE_ID });
      
      // Verifica retcode
      expect(result.retcode).toBe(0);
      
      // Verifica base
      expect(result.base).toBeDefined();
      expect(result.base?.id).toBe(TEST_ROLE_ID);
      expect(result.base?.name).toBe('NovoNome');
      
      // Verifica status
      expect(result.status).toBeDefined();
      expect(result.status?.level).toBeGreaterThan(0);
      expect(result.status?.hp).toBeGreaterThan(0);
      expect(result.status?.mp).toBeGreaterThan(0);
      
    } finally {
    }
  });

  it('deve retornar erro para roleId inválido', async () => {
    // Using .fetch() method directly
    
    try {
      const connection = new GameDBConnection();
    const resultAction = new GetRoleBaseStatus(connection);
    const result = await resultAction.execute({ roleId: 99999 });
      
      expect(result.retcode).not.toBe(0);
      expect(result.base).toBeUndefined();
      expect(result.status).toBeUndefined();
      
    } finally {
    }
  });
});

