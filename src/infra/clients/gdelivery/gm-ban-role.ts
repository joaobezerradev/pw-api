import { FireAndForgetAction } from '@domain/contracts';
import { FireAndForgetProtocol } from '@infra/protocols';
import { BufferWriter, BufferReader } from '@infra/io';
import { GDeliveryConnection } from '@infra/connections';

/**
 * Namespace GMBanRole
 */
export namespace GMBanRole {
  export type Input = {
    roleId: number;
    time: number;
    reason: string;
    gmRoleId?: number;
    ssid?: number;
  };
}

/**
 * Protocol GMKickoutRole - Type 0x168 (360 decimal)
 * Ban de personagem (role)
 */
export class GMBanRole extends FireAndForgetProtocol implements FireAndForgetAction<GMBanRole.Input> {
  private input!: GMBanRole.Input;

  constructor(private readonly connection: GDeliveryConnection) {
    super(0x168); // 360
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

  async execute(params: GMBanRole.Input): Promise<void> {
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

  /**
   * Remove o ban de um personagem (unban)
   * Envia o mesmo protocolo com time=0 para remover o ban
   */
  async unban(params: {
    roleId: number;
    reason?: string;
  }): Promise<void> {
    return this.execute({
      roleId: params.roleId,
      time: 0, // time=0 remove o ban
      reason: params.reason || 'Ban removido'
    });
  }
}

