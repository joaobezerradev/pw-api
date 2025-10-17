import { describe, it, expect } from 'vitest';
import { GetRoleStatus } from '.';

const config = {
  host: '127.0.0.1',
  port: 29400,
};

const TEST_ROLE_ID = 1073;

describe('GetRoleStatus - Teste de Integração', () => {
  it('deve obter status do personagem com sucesso', async () => {
    // Using .fetch() method directly
    
    try {
      const result = await GetRoleStatus.fetch(config.host, config.port, { roleId: TEST_ROLE_ID });
      
      // Verifica retcode
      expect(result.retcode).toBe(0);
      
      // Verifica status
      expect(result.status).toBeDefined();
      expect(result.status?.level).toBeGreaterThan(0);
      expect(result.status?.level2).toBeGreaterThanOrEqual(0);
      expect(result.status?.hp).toBeGreaterThan(0);
      expect(result.status?.mp).toBeGreaterThan(0);
      expect(result.status?.exp).toBeGreaterThanOrEqual(0);
      expect(result.status?.sp).toBeGreaterThanOrEqual(0);
      expect(result.status?.worldtag).toBeGreaterThanOrEqual(0);
      
      // Verifica posição
      expect(result.status?.posx).toBeTypeOf('number');
      expect(result.status?.posy).toBeTypeOf('number');
      expect(result.status?.posz).toBeTypeOf('number');
      
    } finally {
    }
  });

  it('deve retornar erro para roleId inválido', async () => {
    // Using .fetch() method directly
    
    try {
      const result = await GetRoleStatus.fetch(config.host, config.port, { roleId: 99999 });
      
      expect(result.retcode).not.toBe(0);
      expect(result.status).toBeUndefined();
      
    } finally {
    }
  });
});

