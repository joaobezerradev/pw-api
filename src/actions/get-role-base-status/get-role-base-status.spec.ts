import { describe, it, expect } from 'vitest';
import { GameConnection } from '../../core/game-connection';
import { GetRoleBaseStatus } from '.';

const config = {
  host: '127.0.0.1',
  port: 29400,
};

const TEST_ROLE_ID = 1073;

describe('GetRoleBaseStatus - Teste de Integração', () => {
  it('deve obter base e status do personagem em uma chamada', async () => {
    const client = new GameConnection(config.host, config.port);
    
    try {
      const rpc = await client.call(new GetRoleBaseStatus({ roleId: TEST_ROLE_ID }));
      
      // Verifica retcode
      expect(rpc.output.retcode).toBe(0);
      
      // Verifica base
      expect(rpc.output.base).toBeDefined();
      expect(rpc.output.base?.id).toBe(TEST_ROLE_ID);
      expect(rpc.output.base?.name).toBe('JJJ');
      
      // Verifica status
      expect(rpc.output.status).toBeDefined();
      expect(rpc.output.status?.level).toBeGreaterThan(0);
      expect(rpc.output.status?.hp).toBeGreaterThan(0);
      expect(rpc.output.status?.mp).toBeGreaterThan(0);
      
    } finally {
    }
  });

  it('deve retornar erro para roleId inválido', async () => {
    const client = new GameConnection(config.host, config.port);
    
    try {
      const rpc = await client.call(new GetRoleBaseStatus({ roleId: 99999 }));
      
      expect(rpc.output.retcode).not.toBe(0);
      expect(rpc.output.base).toBeUndefined();
      expect(rpc.output.status).toBeUndefined();
      
    } finally {
    }
  });
});

