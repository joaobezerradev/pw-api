import { describe, it, expect } from 'vitest';
import { GetRoleStorehouse } from '.';

const config = {
  host: '127.0.0.1',
  port: 29400,
};

const TEST_ROLE_ID = 1073;

describe('GetRoleStorehouse - Teste de Integração', () => {
  it('deve obter armazém do personagem com sucesso', async () => {
    // Using .fetch() method directly
    
    try {
      const result = await GetRoleStorehouse.fetch(config.host, config.port, { roleId: TEST_ROLE_ID });
      
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
      const result = await GetRoleStorehouse.fetch(config.host, config.port, { roleId: 99999 });
      
      expect(result.retcode).not.toBe(0);
      expect(result.storehouse).toBeUndefined();
      
    } finally {
    }
  });
});
