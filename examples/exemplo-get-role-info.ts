/**
 * Exemplo: GetRoleInfo
 * Buscar informações completas de um personagem
 * 
 * Baseado em pwTools/Role.js
 * RPC Type: 0x1f43 (8003 decimal)
 * Porta: 29400 (GAMEDBD)
 */

import { GameConnection } from '../src/GameConnection';
import { GetRoleInfo } from '../src/protocol/GetRoleInfo';
import { getServerConfig } from '../src/config';

async function exemploGetRoleInfo() {
  console.log('=== Exemplo: GetRoleInfo ===\n');
  
  // Configuração
  const ROLE_ID = 1073;  // ID do personagem a buscar
  
  // Conecta ao servidor de banco de dados
  const config = getServerConfig('GAMEDBD');
  console.log(`Conectando a ${config.host}:${config.port}...`);
  
  const client = new GameConnection(config.host, config.port);
  
  try {
    await client.connect();
    console.log('✓ Conectado!\n');
    
    // Cria o RPC
    const rpc = new GetRoleInfo();
    rpc.setRoleId(ROLE_ID);
    
    console.log(`Buscando personagem ID ${ROLE_ID}...`);
    
    // Faz a chamada
    const result = await client.call(rpc, 10000);
    
    // Processa resultado
    const retcode = result.getRetcode();
    console.log(`Retcode: ${retcode}\n`);
    
    if (retcode === 0) {
      const info = result.getRoleInfo();
      
      if (info) {
        console.log('=== Informações do Personagem ===');
        console.log(`ID: ${info.id}`);
        console.log(`Nome: ${info.name}`);
        console.log(`Raça: ${getRaceName(info.race)}`);
        console.log(`Classe: ${getClassName(info.cls)}`);
        console.log(`Gênero: ${info.gender === 0 ? 'Masculino' : 'Feminino'}`);
        
        if (info.create_time) {
          const date = new Date(info.create_time * 1000);
          console.log(`Criado em: ${date.toLocaleString('pt-BR')}`);
        }
        
        if (info.lastlogin_time) {
          const date = new Date(info.lastlogin_time * 1000);
          console.log(`Último login: ${date.toLocaleString('pt-BR')}`);
        }
        
        console.log(`Status: ${info.status}`);
      }
    } else {
      console.error(`Erro ao buscar personagem. Código: ${retcode}`);
      
      // Códigos de erro comuns
      const errors: Record<number, string> = {
        '-1': 'Erro genérico',
        '-2': 'Personagem não encontrado',
        '-3': 'Permissão negada',
        '-100': 'Timeout de banco de dados'
      };
      
      if (errors[retcode]) {
        console.error(`Descrição: ${errors[retcode]}`);
      }
    }
    
  } catch (error) {
    console.error('\n✗ Erro:', error);
  } finally {
    client.disconnect();
    console.log('\n✓ Desconectado');
  }
}

// Funções auxiliares
function getRaceName(race: number): string {
  const races: Record<number, string> = {
    0: 'Humano',
    1: 'Sirene',
    2: 'Elfo',
    3: 'Bárbaro',
    4: 'Alado',
    5: 'Raposa',
    6: 'Noturno',
    7: 'Glacial'
  };
  return races[race] || `Raça ${race}`;
}

function getClassName(cls: number): string {
  const classes: Record<number, string> = {
    0: 'Guerreiro',
    1: 'Mago',
    2: 'Sacerdote',
    3: 'Mercenário',
    4: 'Arqueiro',
    5: 'Arcano',
    6: 'Feiticeiro',
    7: 'Místico',
    8: 'Bárbaro',
    9: 'Druida',
    10: 'Assassino',
    11: 'Xamã'
  };
  return classes[cls] || `Classe ${cls}`;
}

// Executar
if (require.main === module) {
  exemploGetRoleInfo();
}

export { exemploGetRoleInfo };

