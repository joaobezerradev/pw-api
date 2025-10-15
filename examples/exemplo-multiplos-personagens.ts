/**
 * Exemplo: Consultar múltiplos personagens
 * 
 * Demonstra como fazer várias chamadas RPC sequenciais
 */

import { GameConnection } from '../src/GameConnection';
import { GetRoleInfo } from '../src/protocol/GetRoleInfo';
import { getServerConfig } from '../src/config';

async function consultarMultiplosPersonagens() {
  console.log('=== Consultar Múltiplos Personagens ===\n');

  const config = getServerConfig('GAMEDBD');
  const client = new GameConnection(config.host, config.port);

  try {
    await client.connect();

    // Lista de IDs para consultar
    const roleIds = [1024, 1025, 1026, 1027, 1028];

    console.log(`Consultando ${roleIds.length} personagens...\n`);

    for (const roleId of roleIds) {
      try {
        const rpc = new GetRoleInfo();
        rpc.setRoleId(roleId);

        const resposta = await client.call(rpc, 5000);
        
        if (resposta.getRetcode() === 0) {
          const info = resposta.getRoleInfo();
          if (info) {
            console.log(`[${roleId}] ${info.name} - Nível: ${info.id}`);
          }
        } else {
          console.log(`[${roleId}] Personagem não encontrado`);
        }
      } catch (error) {
        console.error(`[${roleId}] Erro:`, error);
      }

      // Pequeno delay entre as chamadas
      await new Promise(resolve => setTimeout(resolve, 100));
    }

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    client.disconnect();
  }
}

if (require.main === module) {
  consultarMultiplosPersonagens();
}

