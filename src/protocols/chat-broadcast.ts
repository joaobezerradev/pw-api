import { Protocol, BufferWriter, BufferReader, GameConnection } from '../core';

/**
 * Canais de chat disponíveis
 */
export enum ChatChannel {
  WORLD = 9,      // Chat mundial
  SYSTEM = 12,    // Mensagem de sistema
  HORN = 13,      // Horn/Megafone
}

/**
 * Protocol ChatBroadCast - Type 120 (0x78)
 * Envia uma mensagem de broadcast para todos os jogadores online
 * Porta: 29300 (GPROVIDER)
 * 
 * @example
 * ```typescript
 * // Enviar mensagem mundial
 * await ChatBroadcast.send('127.0.0.1', 29300, {
 *   channel: ChatChannel.WORLD,
 *   srcRoleId: 0,  // 0 = mensagem do sistema
 *   message: 'Servidor reiniciará em 10 minutos!',
 * });
 * ```
 */
export class ChatBroadcast extends Protocol {
  private channel: number;
  private emotion: number;
  private srcRoleId: number;
  private message: string;
  private data: string;

  constructor(params: {
    channel: number;
    srcRoleId?: number;
    message: string;
    emotion?: number;
    data?: string;
  }) {
    super(120); // 0x78
    this.channel = params.channel;
    this.emotion = params.emotion ?? 0;
    this.srcRoleId = params.srcRoleId ?? 0;
    this.message = params.message;
    this.data = params.data ?? '';
  }

  marshal(writer: BufferWriter): void {
    // channel (unsigned char)
    writer.writeUInt8(this.channel);
    
    // emotion (unsigned char)
    writer.writeUInt8(this.emotion);
    
    // srcroleid (int)
    writer.writeInt32BE(this.srcRoleId);
    
    // msg (Octets)
    writer.writeOctetsString(this.message);
    
    // data (Octets)
    writer.writeOctetsString(this.data);
  }

  unmarshal(reader: BufferReader): void {
    // Protocol não espera resposta (fire and forget)
  }

  /**
   * Envia o protocolo de broadcast
   * Fire and forget - não espera resposta
   */
  static async send(host: string, port: number, params: {
    channel: number;
    srcRoleId?: number;
    message: string;
    emotion?: number;
    data?: string;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      const net = require('net');
      const socket = new net.Socket();
      
      socket.setTimeout(5000);
      
      socket.on('error', (err: Error) => {
        reject(err);
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      });
      
      socket.on('connect', () => {
        try {
          const protocol = new ChatBroadcast(params);
          
          // Monta o pacote
          const dataWriter = new BufferWriter();
          protocol.marshal(dataWriter);
          const data = dataWriter.toBuffer();
          
          const writer = new BufferWriter();
          writer.writeCompactUINT(protocol.getType());
          writer.writeCompactUINT(data.length);
          writer.writeBuffer(data);
          
          // Envia e fecha imediatamente (fire and forget)
          socket.write(writer.toBuffer(), () => {
            socket.end();
            resolve();
          });
        } catch (error) {
          socket.destroy();
          reject(error);
        }
      });
      
      socket.connect(port, host);
    });
  }

  /**
   * Envia uma mensagem mundial (world chat)
   */
  static async sendWorld(host: string, port: number, params: {
    message: string;
    srcRoleId?: number;
  }): Promise<void> {
    return ChatBroadcast.send(host, port, {
      channel: ChatChannel.WORLD,
      message: params.message,
      srcRoleId: params.srcRoleId ?? 0,
    });
  }

  /**
   * Envia uma mensagem de sistema
   */
  static async sendSystem(host: string, port: number, params: {
    message: string;
  }): Promise<void> {
    return ChatBroadcast.send(host, port, {
      channel: ChatChannel.SYSTEM,
      message: params.message,
      srcRoleId: 0,
    });
  }

  /**
   * Envia uma mensagem via horn/megafone
   */
  static async sendHorn(host: string, port: number, params: {
    message: string;
    srcRoleId?: number;
  }): Promise<void> {
    return ChatBroadcast.send(host, port, {
      channel: ChatChannel.HORN,
      message: params.message,
      srcRoleId: params.srcRoleId ?? 0,
    });
  }
}

