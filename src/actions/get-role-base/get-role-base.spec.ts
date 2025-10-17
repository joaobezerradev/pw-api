import { describe, it, expect } from 'vitest';
import { GetRoleBase } from '.';

const config = {
  host: '127.0.0.1',
  port: 29400,
};

const TEST_ROLE_ID = 1073;

describe('GetRoleBase - Teste de Integração', () => {
  it('deve obter dados básicos do personagem com sucesso', async () => {
    // Using .fetch() method directly
    
    try {
      const result = await GetRoleBase.fetch(config.host, config.port, { roleId: TEST_ROLE_ID });
      
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
    // Using .fetch() method directly
    
    try {
      const result = await GetRoleBase.fetch(config.host, config.port, { roleId: 99999 });
      
      // Deve retornar retcode diferente de 0 (erro)
      expect(result.retcode).not.toBe(0);
      expect(result.base).toBeUndefined();
      
    } finally {
    }
  });
});

