/**
 * Exemplo simples de uso do cliente
 * 
 * Este exemplo mostra como:
 * 1. Conectar ao servidor
 * 2. Fazer uma chamada RPC GetRoleInfo
 * 3. Processar a resposta
 */

import { GameConnection } from '../src/GameConnection';
import { GetRoleInfo } from '../src/protocol/GetRoleInfo';
import { getServerConfig } from '../src/config';

async function exemploSimples() {
  console.log('=== Exemplo Simples: Buscar Informa�0�4�0�1es de Personagem ===\n');

  // 1. Criar o cliente
  const config = getServerConfig('GAMEDBD');
  const client = new GameConnection(config.host, config.port);

  // 2. Configurar eventos (opcional)
  client.on('connected', () => {
    console.log('�7�7 Conex�0�0o estabelecida!');
  });

  client.on('error', (err: Error) => {
    console.error('�7�1 Erro:', err.message);
  });

  try {
    // 3. Conectar ao servidor
    await client.connect();

    // 4. Criar a chamada RPC
    const getRoleInfo = new GetRoleInfo();
    getRoleInfo.setRoleId(1024); // ID do personagem

    console.log('Consultando personagem ID: 1024...\n');

    // 5. Fazer a chamada e aguardar resposta
    const resposta = await client.call(getRoleInfo, 10000); // 10 segundos de timeout

    // 6. Processar a resposta
    const retcode = resposta.getRetcode();
    console.log('C��digo de retorno:', retcode);

    if (retcode === 0) {
      const info = resposta.getRoleInfo();
      
      if (info) {
        console.log('\n=== Dados do Personagem ===');
        console.log('ID........:', info.id);
        console.log('Nome......:', info.name);
        console.log('Ra�0�4a......:', getRaceName(info.race));
        console.log('Classe....:', getClassName(info.cls));
        console.log('G��nero....:', info.gender === 0 ? 'Masculino' : 'Feminino');
        
        if (info.posx !== undefined) {
          console.log(`Posi�0�4�0�0o....: X=${info.posx.toFixed(2)}, Y=${info.posy?.toFixed(2)}, Z=${info.posz?.toFixed(2)}`);
        }
        
        if (info.create_time) {
          const data = new Date(info.create_time * 1000);
          console.log('Criado em.:', data.toLocaleString('pt-BR'));
        }
      }
    } else {
      console.error('Erro ao buscar personagem. C��digo:', retcode);
    }

  } catch (error) {
    console.error('\n�7�1 Erro na execu�0�4�0�0o:', error);
  } finally {
    // 7. Desconectar
    client.disconnect();
    console.log('\n�7�7 Desconectado');
  }
}

// Fun�0�4�0�1es auxiliares para exibir nomes leg��veis
function getRaceName(race: number): string {
  const races: { [key: number]: string } = {
    0: 'Humano',
    1: 'Sirene',
    2: 'Elfo',
    3: 'B��rbaro',
    4: 'Alado',
    5: 'Raposa',
    6: 'Noturno',
    7: 'Glacial'
  };
  return races[race] || `Ra�0�4a ${race}`;
}

function getClassName(cls: number): string {
  const classes: { [key: number]: string } = {
    0: 'Guerreiro',
    1: 'Mago',
    2: 'Sacerdote',
    3: 'Mercen��rio',
    4: 'Arqueiro',
    5: 'Arcano',
    6: 'Feiticeiro',
    7: 'M��stico',
    8: 'B��rbaro',
    9: 'Druida',
    10: 'Assassino',
    11: 'Xam�0�0'
  };
  return classes[cls] || `Classe ${cls}`;
}

// Executar
if (require.main === module) {
  exemploSimples();
}

