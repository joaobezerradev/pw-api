import { FireAndForgetAction } from '@domain/contracts';
import { FireAndForgetProtocol } from '@infra/protocols';
import { BufferWriter, BufferReader } from '@infra/io';
import { GDeliveryConnection } from '@infra/connections';

/**
 * Namespace GMMuteRole
 */
export namespace GMMuteRole {
  export type Input = {
    roleId: number;
    time: number;
    reason: string;
    gmRoleId?: number;
    ssid?: number;
  };
}

/**
 * Protocol GMShutup - Type 0x164 (356 decimal)  
 * Mute de personagem (desabilita chat)
 * Porta: 29100 (GDELIVERYD)
 */
export class GMMuteRole extends FireAndForgetProtocol implements FireAndForgetAction<GMMuteRole.Input> {
  private input!: GMMuteRole.Input;

  constructor(private readonly connection: GDeliveryConnection) {
    super(0x164); // 356
  }

  marshal(writer: BufferWriter): void {
    writer.writeInt32BE(this.input.gmRoleId ?? -1);
    writer.writeUInt32BE(this.input.ssid ?? 0);
    writer.writeUInt32BE(this.input.roleId);
    writer.writeUInt32BE(this.input.time);
    writer.writeOctetsString(this.input.reason);
  }

  unmarshal(reader: BufferReader): void {
    // Protocol não espera resposta (fire and forget)
  }

  async execute(params: GMMuteRole.Input): Promise<void> {
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

  async unmute(params: { roleId: number; reason?: string }): Promise<void> {
    return this.execute({
      roleId: params.roleId,
      time: 0,
      reason: params.reason || 'Mute removido'
    });
  }
}

