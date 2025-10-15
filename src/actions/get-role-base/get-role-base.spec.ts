import { describe, it, expect } from 'vitest';
import { GameConnection } from '../../core/game-connection';
import { GetRoleBase } from '.';

const config = {
  host: '127.0.0.1',
  port: 29400,
};

const TEST_ROLE_ID = 1073;

describe('GetRoleBase - Teste de Integração', () => {
  it('deve obter dados básicos do personagem com sucesso', async () => {
    const client = new GameConnection(config.host, config.port);
    
    try {
      const rpc = await client.call(new GetRoleBase({ roleId: TEST_ROLE_ID }));
      
      // Verifica retcode
      expect(rpc.output.retcode).toBe(0);
      
      // Verifica base
      expect(rpc.output.base).toBeDefined();
      expect(rpc.output.base?.id).toBe(TEST_ROLE_ID);
      expect(rpc.output.base?.name).toBe('JJJ');
      expect(rpc.output.base?.race).toBeTypeOf('number');
      expect(rpc.output.base?.cls).toBeTypeOf('number');
      expect(rpc.output.base?.gender).toBeGreaterThanOrEqual(0);
      expect(rpc.output.base?.gender).toBeLessThanOrEqual(1);
      expect(rpc.output.base?.userid).toBe(1090);
      expect(rpc.output.base?.create_time).toBeGreaterThan(0);
      expect(rpc.output.base?.lastlogin_time).toBeGreaterThan(0);
      
    } finally {
    }
  });

  it('deve retornar erro para roleId inválido', async () => {
    const client = new GameConnection(config.host, config.port);
    
    try {
      const rpc = await client.call(new GetRoleBase({ roleId: 99999 }));
      
      // Deve retornar retcode diferente de 0 (erro)
      expect(rpc.output.retcode).not.toBe(0);
      expect(rpc.output.base).toBeUndefined();
      
    } finally {
    }
  });
});

