import { describe, it, expect } from 'vitest';
import { GameConnection } from '../../core/game-connection';
import { GetRoleStatus } from '.';

const config = {
  host: '127.0.0.1',
  port: 29400,
};

const TEST_ROLE_ID = 1073;

describe('GetRoleStatus - Teste de Integração', () => {
  it('deve obter status do personagem com sucesso', async () => {
    const client = new GameConnection(config.host, config.port);
    
    try {
      const rpc = await client.call(new GetRoleStatus({ roleId: TEST_ROLE_ID }));
      
      // Verifica retcode
      expect(rpc.output.retcode).toBe(0);
      
      // Verifica status
      expect(rpc.output.status).toBeDefined();
      expect(rpc.output.status?.level).toBeGreaterThan(0);
      expect(rpc.output.status?.level2).toBeGreaterThanOrEqual(0);
      expect(rpc.output.status?.hp).toBeGreaterThan(0);
      expect(rpc.output.status?.mp).toBeGreaterThan(0);
      expect(rpc.output.status?.exp).toBeGreaterThanOrEqual(0);
      expect(rpc.output.status?.sp).toBeGreaterThanOrEqual(0);
      expect(rpc.output.status?.worldtag).toBeGreaterThanOrEqual(0);
      
      // Verifica posição
      expect(rpc.output.status?.posx).toBeTypeOf('number');
      expect(rpc.output.status?.posy).toBeTypeOf('number');
      expect(rpc.output.status?.posz).toBeTypeOf('number');
      
    } finally {
    }
  });

  it('deve retornar erro para roleId inválido', async () => {
    const client = new GameConnection(config.host, config.port);
    
    try {
      const rpc = await client.call(new GetRoleStatus({ roleId: 99999 }));
      
      expect(rpc.output.retcode).not.toBe(0);
      expect(rpc.output.status).toBeUndefined();
      
    } finally {
    }
  });
});

