/**
 * Teste simples de conexão para ver o que o servidor envia
 */
import * as net from 'net';
import { getServerConfig } from './config';
import { BufferReader } from './protocol/BufferReader';

async function testConnection() {
  const services = ['GAMEDBD', 'GDELIVERYD', 'GPROVIDER'] as const;
  
  for (const service of services) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testando ${service}`);
    console.log('='.repeat(60));
    
    const config = getServerConfig(service);
    console.log(`Host: ${config.host}:${config.port}\n`);
    
    const socket = new net.Socket();
    
    const promise = new Promise<void>((resolve) => {
      let timeout: NodeJS.Timeout;
      
      socket.on('connect', () => {
        console.log('✓ Conectado!');
        console.log('  Aguardando dados do servidor...\n');
        
        // Timeout de 5 segundos
        timeout = setTimeout(() => {
          console.log('⏱ Timeout - servidor não enviou dados');
          socket.destroy();
          resolve();
        }, 5000);
      });
      
      socket.on('data', (data: Buffer) => {
        clearTimeout(timeout);
        console.log(`← Recebido ${data.length} bytes:`);
        console.log('  Hex:', data.toString('hex'));
        console.log('  ASCII:', data.toString('ascii').replace(/[^\x20-\x7E]/g, '.'));
        
        // Tenta ler como protocolo
        try {
          const reader = new BufferReader(data);
          const size = reader.readCompactUINT();
          console.log(`  Tamanho do pacote (CompactUINT): ${size}`);
          
          if (reader.hasMore()) {
            const type = reader.readCompactUINT();
            console.log(`  Tipo do protocolo: ${type}`);
            
            if (type === 1) {
              console.log('  >> Protocolo Challenge detectado!');
            }
          }
        } catch (err) {
          console.log('  Erro ao decodificar:', err);
        }
        
        socket.destroy();
        resolve();
      });
      
      socket.on('error', (err: Error) => {
        console.error('✗ Erro:', err.message);
        resolve();
      });
      
      socket.on('close', () => {
        console.log('✗ Conexão fechada pelo servidor');
        clearTimeout(timeout);
        resolve();
      });
      
      socket.connect(config.port, config.host);
    });
    
    await promise;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('Teste concluído');
  console.log('='.repeat(60));
}

testConnection().catch(console.error);

