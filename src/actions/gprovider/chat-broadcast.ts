import { FireAndForgetProtocol, BufferWriter, BufferReader, GProviderConnection, FireAndForgetAction } from '../../core';

/**
 * Canais de chat disponíveis
 */
export enum ChatChannel {
  WORLD = 9,      // Chat mundial
  SYSTEM = 12,    // Mensagem de sistema
  HORN = 13,      // Horn/Megafone
}

/**
 * Namespace ChatBroadcast
 */
export namespace ChatBroadcast {
  export type Input = {
    channel: number;
    message: string;
    srcRoleId?: number;
    emotion?: number;
    data?: string;
  };
}

/**
 * Protocol ChatBroadCast - Type 120 (0x78)
 * Envia uma mensagem de broadcast para todos os jogadores online
 */
export class ChatBroadcast extends FireAndForgetProtocol implements FireAndForgetAction<ChatBroadcast.Input> {
  private input!: ChatBroadcast.Input;

  constructor(private readonly connection: GProviderConnection) {
    super(120); // 0x78
  }

  marshal(writer: BufferWriter): void {
    writer.writeUInt8(this.input.channel);
    writer.writeUInt8(this.input.emotion ?? 0);
    writer.writeInt32BE(this.input.srcRoleId ?? 0);
    writer.writeOctetsString(this.input.message);
    writer.writeOctetsString(this.input.data ?? '');
  }

  unmarshal(reader: BufferReader): void {
    // Protocol não espera resposta (fire and forget)
  }

  async execute(params: ChatBroadcast.Input): Promise<void> {
    this.input = params;
    const dataWriter = new BufferWriter();
    this.marshal(dataWriter);
    const data = dataWriter.toBuffer();
    
    return new Promise((resolve, reject) => {
      const net = require('net');
      const socket = new net.Socket();
      
      socket.setTimeout(this.connection.timeout);
      socket.on('error', (err: Error) => reject(err));
      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      });
      
      socket.on('connect', () => {
        const writer = new BufferWriter();
        writer.writeCompactUINT(this.getType());
        writer.writeCompactUINT(data.length);
        writer.writeBuffer(data);
        
        socket.write(writer.toBuffer(), () => {
          socket.end();
          resolve();
        });
      });
      
      socket.connect(this.connection.port, this.connection.host);
    });
  }

  async sendWorld(params: { message: string; srcRoleId?: number }): Promise<void> {
    return this.execute({
      channel: ChatChannel.WORLD,
      message: params.message,
      srcRoleId: params.srcRoleId ?? 0,
    });
  }

  async sendSystem(params: { message: string }): Promise<void> {
    return this.execute({
      channel: ChatChannel.SYSTEM,
      message: params.message,
      srcRoleId: 0,
    });
  }

  async sendHorn(params: { message: string; srcRoleId?: number }): Promise<void> {
    return this.execute({
      channel: ChatChannel.HORN,
      message: params.message,
      srcRoleId: params.srcRoleId ?? 0,
    });
  }
}

