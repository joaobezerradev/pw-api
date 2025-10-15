import { describe, it, expect } from 'vitest';
import { GameConnection } from '../../core/game-connection';
import { GetRoleEquipment } from '.';

const config = {
  host: '127.0.0.1',
  port: 29400,
};

const TEST_ROLE_ID = 1073;

describe('GetRoleEquipment - Teste de Integração', () => {
  it('deve obter equipamentos do personagem com sucesso', async () => {
    const client = new GameConnection(config.host, config.port);
    
    try {
      const rpc = await client.call(new GetRoleEquipment({ roleId: TEST_ROLE_ID }));
      
      // Verifica retcode
      expect(rpc.output.retcode).toBe(0);
      
      // Verifica equipment
      expect(rpc.output.equipment).toBeInstanceOf(Array);
      
      // Se houver equipamentos, verifica estrutura
      if (rpc.output.equipment.length > 0) {
        const item = rpc.output.equipment[0];
        expect(item.id).toBeGreaterThan(0);
        expect(item.pos).toBeGreaterThanOrEqual(0);
        expect(item.count).toBeGreaterThan(0);
        expect(item.data).toBeInstanceOf(Buffer);
      }
      
    } finally {
    }
  });

  it('deve retornar erro para roleId inválido', async () => {
    const client = new GameConnection(config.host, config.port);
    
    try {
      const rpc = await client.call(new GetRoleEquipment({ roleId: 99999 }));
      
      expect(rpc.output.retcode).not.toBe(0);
      
    } finally {
    }
  });
});

