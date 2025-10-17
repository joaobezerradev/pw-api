import { describe, it, expect } from 'vitest';
import { GetRoleEquipment } from '.';

const config = {
  host: '127.0.0.1',
  port: 29400,
};

const TEST_ROLE_ID = 1073;

describe('GetRoleEquipment - Teste de Integração', () => {
  it('deve obter equipamentos do personagem com sucesso', async () => {
    // Using .fetch() method directly
    
    try {
      const result = await GetRoleEquipment.fetch(config.host, config.port, { roleId: TEST_ROLE_ID });
      
      // Verifica retcode
      expect(result.retcode).toBe(0);
      
      // Verifica equipment
      expect(result.equipment).toBeInstanceOf(Array);
      
      // Se houver equipamentos, verifica estrutura
      if (result.equipment.length > 0) {
        const item = result.equipment[0];
        expect(item.id).toBeGreaterThan(0);
        expect(item.pos).toBeGreaterThanOrEqual(0);
        expect(item.count).toBeGreaterThan(0);
        expect(item.data).toBeInstanceOf(Buffer);
      }
      
    } finally {
    }
  });

  it('deve retornar erro para roleId inválido', async () => {
    // Using .fetch() method directly
    
    try {
      const result = await GetRoleEquipment.fetch(config.host, config.port, { roleId: 99999 });
      
      expect(result.retcode).not.toBe(0);
      
    } finally {
    }
  });
});

