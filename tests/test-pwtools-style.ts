/**
 * Teste no estilo pwTools para verificar se funciona
 */
import * as net from 'net';
import { getServerConfig } from './config';

function testPWToolsStyle() {
  const config = getServerConfig('GAMEDBD');
  
  console.log('=== Teste no estilo pwTools ===');
  console.log(`Conectando a ${config.host}:${config.port}...\n`);
  
  const client = net.connect({ host: config.host, port: config.port });
  
  client.on('connect', () => {
    console.log('✓ Conectado!');
    
    // Monta o pacote GetRoleInfo (0x1f43)
    const roleId = 1073;
    const data: number[] = [];
    
    // Função auxiliar para adicionar UInt32 Big-Endian
    const writeUInt32BE = (value: number) => {
      if (value < 0) value = 0xffffffff - 1 - value;
      data.push((value >> 24) & 0xFF);
      data.push((value >> 16) & 0xFF);
      data.push((value >> 8) & 0xFF);
      data.push(value & 0xFF);
    };
    
    // Função para escrever CompactUINT
    const writeCUInt = (value: number) => {
      if (value <= 0x7F) {
        data.push(value);
      } else if (value <= 0x3FFF) {
        const val = value + 0x8000;
        data.push((val >> 8) & 0xFF);
        data.push(val & 0xFF);
      } else if (value <= 0x1FFFFFFF) {
        const val = value + 0xC0000000;
        data.push((val >> 24) & 0xFF);
        data.push((val >> 16) & 0xFF);
        data.push((val >> 8) & 0xFF);
        data.push(val & 0xFF);
      } else {
        data.push(0xE0);
        writeUInt32BE(value);
      }
    };
    
    // Argumentos do GetRoleInfo
    writeUInt32BE(-1);  // localsid
    writeUInt32BE(roleId);  // roleId
    
    // Adiciona opcode (0x1f43 = 8003) e tamanho no início
    const packetData = [...data];
    data.length = 0;
    
    writeCUInt(packetData.length);
    writeCUInt(0x1f43);
    data.push(...packetData);
    
    const buffer = Buffer.from(data);
    
    console.log('→ Enviando pacote:');
    console.log('  Tamanho:', buffer.length, 'bytes');
    console.log('  Hex:', buffer.toString('hex'));
    console.log('  Dados:', data.map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
    console.log('');
    
    client.write(buffer);
  });
  
  client.on('data', (data: Buffer) => {
    console.log('← Recebido resposta:');
    console.log('  Tamanho:', data.length, 'bytes');
    console.log('  Hex:', data.toString('hex'));
    console.log('');
    
    // Tenta decodificar
    let offset = 0;
    
    const readCUInt = (): number => {
      let value = data.readUInt8(offset++);
      
      switch(value & 0xE0) {
        case 0xE0:
          value = data.readUInt32BE(offset);
          offset += 4;
          break;
        case 0xC0:
          offset--;
          value = data.readUInt32BE(offset) & 0x1FFFFFFF;
          offset += 4;
          break;
        case 0x80:
        case 0xA0:
          offset--;
          value = data.readUInt16BE(offset) & 0x3FFF;
          offset += 2;
          break;
      }
      
      return value;
    };
    
    try {
      const packetSize = readCUInt();
      const opcode = readCUInt();
      const retcode = data.readUInt32BE(offset);
      offset += 4;
      
      console.log('Decodificação:');
      console.log('  Tamanho do pacote:', packetSize);
      console.log('  Opcode:', '0x' + opcode.toString(16), `(${opcode})`);
      console.log('  Retcode:', retcode);
      
      if (retcode === 0) {
        console.log('  ✓ Sucesso!');
        
        // Tenta ler os dados do personagem
        const version = data.readUInt8(offset++);
        const id = data.readUInt32BE(offset);
        offset += 4;
        
        // Lê o nome (CompactUINT + string UTF-16LE)
        const nameLen = readCUInt();
        const name = data.toString('utf16le', offset, offset + nameLen);
        offset += nameLen;
        
        const race = data.readUInt32BE(offset);
        offset += 4;
        const cls = data.readUInt32BE(offset);
        offset += 4;
        const gender = data.readUInt8(offset++);
        
        console.log('\n=== Informações do Personagem ===');
        console.log('  ID:', id);
        console.log('  Nome:', name);
        console.log('  Raça:', race);
        console.log('  Classe:', cls);
        console.log('  Gênero:', gender === 0 ? 'Masculino' : 'Feminino');
      } else {
        console.log('  ✗ Erro - Código:', retcode);
      }
    } catch (err) {
      console.error('Erro ao decodificar:', err);
    }
    
    client.destroy();
  });
  
  client.on('error', (err: Error) => {
    console.error('✗ Erro:', err.message);
  });
  
  client.on('close', () => {
    console.log('\n✗ Conexão fechada');
  });
}

testPWToolsStyle();

