import { BufferReader } from '../infra/io/buffer-reader';

/**
 * Informações do servidor
 */
export type ServerInfo = {
  online: boolean;
  attributes?: number;
  freeCreateTime?: number;
  expRate?: number;
  latency?: number;
};

/**
 * ServerStatus - Utilitário para verificar status do servidor
 * 
 * Conecta na porta e aguarda receber AnnounceServerAttribute (Type 132)
 * que o servidor envia automaticamente na conexão.
 * 
 * @example
 * ```typescript
 * import { ServerStatus } from './src';
 * 
 * // Check simples
 * const isOnline = await ServerStatus.check('127.0.0.1', 29100);
 * console.log(`Servidor: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
 * 
 * // Com informações detalhadas
 * const info = await ServerStatus.getInfo('127.0.0.1', 29100);
 * console.log(`Status: ${info.online ? 'ONLINE' : 'OFFLINE'}`);
 * console.log(`EXP Rate: ${info.expRate}x`);
 * console.log(`Latência: ${info.latency}ms`);
 * ```
 */
export class ServerStatus {
  /**
   * Verifica se o servidor está online
   * Retorna true se conseguir conectar e receber AnnounceServerAttribute
   */
  static async check(host: string, port: number, timeout: number = 5000): Promise<boolean> {
    try {
      const info = await this.getInfo(host, port, timeout);
      return info.online;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtém informações detalhadas do servidor
   * Inclui status, atributos, exp rate e latência
   */
  static async getInfo(host: string, port: number, timeout: number = 5000): Promise<ServerInfo> {
    return new Promise((resolve) => {
      const net = require('net');
      const socket = new net.Socket();
      const startTime = Date.now();
      
      let responseBuffer = Buffer.alloc(0);
      let resolved = false;
      
      socket.setTimeout(timeout);
      
      socket.on('error', () => {
        if (!resolved) {
          resolved = true;
          socket.destroy();
          resolve({ online: false });
        }
      });
      
      socket.on('timeout', () => {
        if (!resolved) {
          resolved = true;
          socket.destroy();
          resolve({ online: false });
        }
      });
      
      socket.on('data', (data: Buffer) => {
        if (resolved) return;
        
        responseBuffer = Buffer.concat([responseBuffer, data]);
        
        try {
          const reader = new BufferReader(responseBuffer);
          
          // Procura pelo protocolo 132 (AnnounceServerAttribute)
          while (reader.hasMore() && !resolved) {
            const startPos = reader.getOffset();
            
            try {
              const protocolType = reader.readCompactUINT();
              const protocolSize = reader.readCompactUINT();
              
              if (protocolType === 132) {
                // AnnounceServerAttribute encontrado!
                const attributes = reader.readUInt32BE();
                const freeCreateTime = reader.readInt32BE();
                const expRate = reader.readUInt8();
                const latency = Date.now() - startTime;
                
                resolved = true;
                socket.end();
                
                resolve({
                  online: true,
                  attributes,
                  freeCreateTime,
                  expRate,
                  latency,
                });
              } else {
                // Pula este protocolo
                reader.setOffset(reader.getOffset() + protocolSize);
              }
            } catch (e) {
              // Dados incompletos, aguarda mais
              reader.setOffset(startPos);
              break;
            }
          }
        } catch (error) {
          // Aguarda mais dados
        }
      });
      
      socket.on('connect', () => {
        // Apenas conecta e aguarda o servidor enviar AnnounceServerAttribute
        // Não precisa enviar nada
      });
      
      socket.connect(port, host);
    });
  }

  /**
   * Verifica múltiplos servidores em paralelo
   * Útil para checar status de vários servidores/portas
   */
  static async checkMultiple(servers: Array<{ host: string; port: number; name?: string }>, timeout: number = 5000): Promise<Map<string, ServerInfo>> {
    const results = new Map<string, ServerInfo>();
    
    await Promise.all(
      servers.map(async (server) => {
        const key = server.name || `${server.host}:${server.port}`;
        const info = await this.getInfo(server.host, server.port, timeout);
        results.set(key, info);
      })
    );
    
    return results;
  }

  /**
   * Monitora o servidor continuamente
   * Chama o callback a cada intervalo com o status atual
   */
  static monitor(
    host: string,
    port: number,
    intervalMs: number,
    callback: (info: ServerInfo) => void,
    timeout: number = 5000
  ): () => void {
    let stopped = false;
    
    const checkLoop = async () => {
      while (!stopped) {
        const info = await this.getInfo(host, port, timeout);
        callback(info);
        
        // Aguarda o intervalo
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    };
    
    checkLoop();
    
    // Retorna função para parar o monitoramento
    return () => {
      stopped = true;
    };
  }
}

