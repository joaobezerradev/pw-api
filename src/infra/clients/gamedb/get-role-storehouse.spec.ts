import { describe, it, expect, beforeAll } from 'vitest';
import { GameDBConnection } from '@infra/connections';
import { GetRoleStorehouse } from '@infra/clients';

// Setup ENVs para teste
beforeAll(() => {
  process.env.GAME_SERVER_HOST = '127.0.0.1';
  process.env.GAMEDB_PORT = '29400';
  process.env.GAMEDB_TIMEOUT = '20000';
});

const TEST_ROLE_ID = 1073;

describe('GetRoleStorehouse - Teste de Integração', () => {
  it('deve obter armazém do personagem com sucesso', async () => {
    // Using .fetch() method directly
    
    try {
      const connection = new GameDBConnection();
    const resultAction = new GetRoleStorehouse(connection);
    const result = await resultAction.execute({ roleId: TEST_ROLE_ID });
      
      // Verifica retcode
      expect(result.retcode).toBe(0);
      
      // Verifica storehouse
      expect(result.storehouse).toBeDefined();
      expect(result.storehouse?.capacity).toBeGreaterThan(0);
      expect(result.storehouse?.money).toBeGreaterThanOrEqual(0);
      expect(result.storehouse?.items).toBeInstanceOf(Array);
      expect(result.storehouse?.dress).toBeInstanceOf(Array);
      expect(result.storehouse?.material).toBeInstanceOf(Array);
      expect(result.storehouse?.generalcard).toBeInstanceOf(Array);
      
      // Se houver itens, verifica estrutura
      if (result.storehouse && result.storehouse.items.length > 0) {
        const item = result.storehouse.items[0];
        expect(item.id).toBeGreaterThan(0);
        expect(item.count).toBeGreaterThan(0);
        expect(item.data).toBeInstanceOf(Buffer);
      }
      
    } finally {
    }
  });

  it('deve retornar erro para roleId inválido', async () => {
    // Using .fetch() method directly
    
    try {
      const connection = new GameDBConnection();
    const resultAction = new GetRoleStorehouse(connection);
    const result = await resultAction.execute({ roleId: 99999 });
      
      expect(result.retcode).not.toBe(0);
      expect(result.storehouse).toBeUndefined();
      
    } finally {
    }
  });
});
