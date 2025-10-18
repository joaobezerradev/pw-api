import * as net from 'net';
import { BufferWriter } from '../io/buffer-writer';
import { BufferReader } from '../io/buffer-reader';
import { Protocol } from './protocol';

/**
 * RPC Base
 * Classe base para protocolos com resposta
 */
export abstract class Rpc extends Protocol {
  constructor(type: number) {
    super(type);
  }
}

/**
 * BaseRpc - Classe base para RPCs (com resposta)
 * Implementa a lógica completa de conexão, envio e recebimento
 */
export abstract class BaseRpc<TInput, TOutput> extends Rpc {
  protected input: TInput;
  public output: TOutput;

  constructor(type: number, input: TInput, defaultOutput: TOutput) {
    super(type);
    this.input = input;
    this.output = defaultOutput;
  }

  /**
   * Serializa os argumentos de entrada
   */
  abstract marshalArgument(writer: BufferWriter, input: TInput): void;

  /**
   * Deserializa o resultado recebido
   */
  abstract unmarshalResult(reader: BufferReader): void;

  /**
   * Implementação de marshal para Protocol
   */
  marshal(writer: BufferWriter): void {
    this.marshalArgument(writer, this.input);
  }

  /**
   * Implementação de unmarshal para Protocol
   */
  unmarshal(reader: BufferReader): void {
    this.unmarshalResult(reader);
  }

  /**
   * Executa o RPC e retorna a resposta
   */
  protected static async executeRpc<T extends BaseRpc<any, any>>(
    host: string,
    port: number,
    rpc: T,
    timeout: number = 20000
  ): Promise<T['output']> {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      
      socket.setTimeout(timeout);
      
      socket.on('error', (err: Error) => {
        reject(err);
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      });
      
      let responseBuffer = Buffer.alloc(0);
      let foundResponse = false;
      
      socket.on('data', (data: Buffer) => {
        responseBuffer = Buffer.concat([responseBuffer, data]);
        
        if (foundResponse) return;
        
        try {
          const reader = new BufferReader(responseBuffer);
          
          // Lê o header do protocolo
          const responseType = reader.readCompactUINT();
          const size = reader.readCompactUINT();
          
          // Verifica se temos todos os dados
          if (responseBuffer.length >= reader.getOffset() + size) {
            foundResponse = true;
            
            // Deserializa a resposta
            rpc.unmarshalResult(reader);
            
            socket.end();
            resolve(rpc.output);
          }
        } catch (error) {
          // Aguarda mais dados
        }
      });
      
      socket.on('connect', () => {
        try {
          // Serializa o argumento
          const dataWriter = new BufferWriter();
          rpc.marshalArgument(dataWriter, rpc.input);
          const data = dataWriter.toBuffer();
          
          // Monta o pacote RPC: [type][size][data]
          const writer = new BufferWriter();
          writer.writeCompactUINT(rpc.getType());
          writer.writeCompactUINT(data.length);
          writer.writeBuffer(data);
          
          socket.write(writer.toBuffer());
        } catch (error) {
          socket.destroy();
          reject(error);
        }
      });
      
      socket.connect(port, host);
    });
  }
}

/**
 * Classe base para protocolos com resposta e paginação
 */
export abstract class PaginatedProtocol<TInput, TOutput, TItem> extends Protocol {
  /**
   * Busca uma página de dados
   */
  protected static async fetchPageGeneric<T extends Protocol>(
    host: string,
    port: number,
    protocol: T,
    timeout: number = 30000
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      
      socket.setTimeout(timeout);
      
      socket.on('error', (err: Error) => {
        reject(err);
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      });
      
      let responseBuffer = Buffer.alloc(0);
      let foundResponse = false;
      
      socket.on('data', (data: Buffer) => {
        responseBuffer = Buffer.concat([responseBuffer, data]);
        
        if (foundResponse) return;
        
        try {
          const reader = new BufferReader(responseBuffer);
          
          // Pode receber múltiplos protocolos, procura pelo tipo correto
          while (reader.hasMore()) {
            const startPos = reader.getOffset();
            
            try {
              const responseType = reader.readCompactUINT();
              const size = reader.readCompactUINT();
              
              if (responseType === protocol.getType() + 1) {
                // Protocolo de resposta encontrado (geralmente type + 1)
                foundResponse = true;
                
                // Extrai os dados da resposta
                const responseData = responseBuffer.subarray(
                  reader.getOffset(),
                  reader.getOffset() + size
                );
                
                socket.end();
                resolve(responseData);
                break;
              } else {
                // Pula protocolos que não interessam
                reader.setOffset(reader.getOffset() + size);
              }
            } catch (e) {
              // Dados incompletos, volta e aguarda mais
              reader.setOffset(startPos);
              break;
            }
          }
        } catch (error) {
          // Aguarda mais dados
        }
      });
      
      socket.on('connect', () => {
        try {
          // Serializa os dados
          const dataWriter = new BufferWriter();
          protocol.marshal(dataWriter);
          const data = dataWriter.toBuffer();
          
          // Monta o pacote
          const writer = new BufferWriter();
          writer.writeCompactUINT(protocol.getType());
          writer.writeCompactUINT(data.length);
          writer.writeBuffer(data);
          
          socket.write(writer.toBuffer());
        } catch (error) {
          socket.destroy();
          reject(error);
        }
      });
      
      socket.connect(port, host);
    });
  }
}

