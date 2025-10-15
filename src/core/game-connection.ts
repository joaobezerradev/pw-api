import * as net from 'net';
import { EventEmitter } from 'events';
import { Protocol, Rpc } from './protocol';
import { BufferReader } from './buffer-reader';
import { BufferWriter } from './buffer-writer';
import { Logger, LogLevel, createLogger } from './logger';

/**
 * Conexão com o servidor - Gerencia conexões TCP efêmeras e RPCs
 * 
 * IMPORTANTE: O servidor GAMEDBD não aceita conexões persistentes.
 * Cada RPC cria uma nova conexão TCP, envia a requisição, aguarda resposta e fecha.
 */
export class GameConnection extends EventEmitter {
  private host: string;
  private port: number;
  private xidCounter: number = 1;
  private logger: Logger;

  constructor(host: string, port: number, logLevel: LogLevel = LogLevel.INFO) {
    super();
    this.host = host;
    this.port = port;
    this.logger = createLogger(logLevel);
  }

  /**
   * Gera próximo XID com proteção contra overflow
   */
  private getNextXid(): number {
    const xid = this.xidCounter;
    this.xidCounter = this.xidCounter >= 0x7FFFFFFF ? 1 : this.xidCounter + 1;
    return xid;
  }

  /**
   * Envia um RPC e aguarda resposta
   * Cria uma nova conexão TCP para cada chamada (como pwTools faz)
   * 
   * Fluxo:
   * 1. Cria nova conexão TCP
   * 2. Conecta ao servidor
   * 3. Envia pacote RPC
   * 4. Aguarda resposta completa (pode incluir LinkAnnouce para porta 29100)
   * 5. Fecha conexão
   * 6. Retorna resultado
   */
  async call<T extends Rpc>(rpc: T, timeout: number = 30000, skipLinkAnnouce: boolean = false): Promise<T> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      // Cria nova conexão com configurações otimizadas
      const socket = new net.Socket();
      socket.setNoDelay(true);      // Desabilita Nagle's algorithm
      socket.setTimeout(timeout);    // Timeout no socket
      
      let responseReceived = false;
      const chunks: Buffer[] = [];   // Buffer eficiente (sem concat repetido)
      let connectionEstablished = false;
      let linkAnnounceSkipped = false; // Para porta 29100 (gdeliveryd)

      // Timeout
      const timer = setTimeout(() => {
        if (!responseReceived) {
          socket.destroy();
          reject(new Error(`RPC timeout (type=${rpc.getType()})`));
        }
      }, timeout);

      // Quando conectar, envia o pacote
      socket.on('connect', () => {
        connectionEstablished = true;
        this.logger.debug({ 
          event: 'rpc_connect',
          rpc: rpc.constructor.name,
          type: rpc.getType(),
          host: this.host,
          port: this.port
        });
        
        try {
          // Gera XID único com proteção contra overflow
          const xid = this.getNextXid();
          rpc.setXid(xid);

          // Codifica apenas os dados (argumentos)
          const dataWriter = new BufferWriter();
          rpc.marshalArgument(dataWriter);
          const data = dataWriter.toBuffer();
          
          // Monta o pacote: [opcode][tamanho][dados]
          const writer = new BufferWriter();
          writer.writeCompactUINT(rpc.getType());
          writer.writeCompactUINT(data.length);
          writer.writeBuffer(data);
          
          const finalPacket = writer.toBuffer();
          
          this.logger.debug({
            event: 'rpc_send',
            rpc: rpc.constructor.name,
            type: rpc.getType(),
            size: finalPacket.length
          });
          
          socket.write(finalPacket);
        } catch (err) {
          clearTimeout(timer);
          socket.destroy();
          reject(err);
        }
      });

      // Quando receber dados
      socket.on('data', (data: Buffer) => {
        this.logger.trace({
          event: 'rpc_data_received',
          bytes: data.length
        });
        
        // Buffer eficiente: adiciona ao array sem concat repetido
        chunks.push(data);
        const buffer = chunks.length === 1 ? chunks[0] : Buffer.concat(chunks);

        // Tenta processar o pacote
        try {
          const reader = new BufferReader(buffer);
          
          // Lê header: [opcode][tamanho]
          const opcode = reader.readCompactUINT();
          const dataSize = reader.readCompactUINT();
          const dataPosition = reader.getOffset();

          // Verifica se temos todos os dados
          if (buffer.length >= dataPosition + dataSize) {
            responseReceived = true;
            clearTimeout(timer);

            // Extrai apenas os dados
            const data = buffer.subarray(dataPosition, dataPosition + dataSize);

            // Deserializa a resposta
            const dataReader = new BufferReader(data);
            rpc.unmarshalResult(dataReader);

            const latency = Date.now() - startTime;
            
            // Log apenas do objeto deserializado
            this.logger.info({
              event: 'rpc_success',
              rpc: rpc.constructor.name,
              type: opcode,
              latency,
              output: (rpc as any).output  // Objeto deserializado, não binário
            });

            // Fecha a conexão e resolve
            socket.destroy();
            resolve(rpc);
          }
        } catch (err) {
          // Aguardando mais dados
          this.logger.trace({ event: 'rpc_incomplete_data' });
        }
      });

      // Erro de conexão
      socket.on('error', (err: Error) => {
        clearTimeout(timer);
        
        this.logger.error({
          event: 'rpc_error',
          rpc: rpc.constructor.name,
          error: err.message,
          connected: connectionEstablished
        });
        
        if (!connectionEstablished) {
          reject(new Error(`Falha ao conectar: ${err.message}`));
        } else if (!responseReceived) {
          reject(new Error(`Erro durante comunicação: ${err.message}`));
        }
      });

      // Conexão fechada
      socket.on('close', (hadError: boolean) => {
        clearTimeout(timer);
        
        if (!responseReceived) {
          this.logger.warn({
            event: 'rpc_closed_without_response',
            rpc: rpc.constructor.name,
            hadError
          });
          
          reject(new Error('Connection closed without response'));
        } else {
          this.logger.debug({
            event: 'rpc_connection_closed',
            rpc: rpc.constructor.name
          });
        }
      });

      // Conecta ao servidor
      this.logger.debug({
        event: 'rpc_connecting',
        host: this.host,
        port: this.port
      });
      
      socket.connect(this.port, this.host);
    });
  }
}

