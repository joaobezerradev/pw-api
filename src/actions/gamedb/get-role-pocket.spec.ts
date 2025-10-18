import { describe, it, expect, beforeAll } from 'vitest';
import { GetRolePocket } from './get-role-pocket';
import { GameDBConnection } from '../../';

// Setup ENVs para teste
beforeAll(() => {
  process.env.GAME_SERVER_HOST = '127.0.0.1';
  process.env.GAMEDB_PORT = '29400';
  process.env.GAMEDB_TIMEOUT = '20000';
});

const TEST_ROLE_ID = 1073;

describe('GetRolePocket - Teste de Integração', () => {
  it('deve obter inventário do personagem com sucesso', async () => {
    // Using .fetch() method directly
    
    try {
      const connection = new GameDBConnection();
    const resultAction = new GetRolePocket(connection);
    const result = await resultAction.execute({ roleId: TEST_ROLE_ID });
      
      // Verifica retcode
      expect(result.retcode).toBe(0);
      
      // Verifica pocket
      expect(result.pocket).toBeDefined();
      expect(result.pocket?.capacity).toBeGreaterThan(0);
      expect(result.pocket?.money).toBeGreaterThanOrEqual(0);
      expect(result.pocket?.items).toBeInstanceOf(Array);
      expect(result.pocket?.timestamp).toBeTypeOf('number');
      
      // Se houver itens, verifica estrutura
      if (result.pocket && result.pocket.items.length > 0) {
        const item = result.pocket.items[0];
        expect(item.id).toBeGreaterThan(0);
        expect(item.count).toBeGreaterThan(0);
        expect(item.max_count).toBeGreaterThan(0);
        expect(item.data).toBeInstanceOf(Buffer);
      }
      
    } finally {
    }
  });

  it('deve retornar erro para roleId inválido', async () => {
    // Using .fetch() method directly
    
    try {
      const connection = new GameDBConnection();
    const resultAction = new GetRolePocket(connection);
    const result = await resultAction.execute({ roleId: 99999 });
      
      expect(result.retcode).not.toBe(0);
      expect(result.pocket).toBeUndefined();
      
    } finally {
    }
  });
});

