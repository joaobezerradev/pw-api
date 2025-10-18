import { FireAndForgetProtocol, BufferWriter, BufferReader, GDeliveryConnection, FireAndForgetAction } from '../../core';

/**
 * Protocol GMKickoutRole - Type 0x168 (360 decimal)
 * Ban de personagem (role)
 * Porta: 29100 (GDELIVERYD)
 * 
 * @example
 * ```typescript
 * const gdelivery = new GDeliveryConnection();
 * const gmBanRole = new GMBanRole(gdelivery);
 * 
 * // Banir personagem
 * await gmBanRole.execute({
 *   roleId: 1073,
 *   time: 3600,
 *   reason: 'Comportamento inadequado'
 * });
 * 
 * // Remover ban
 * await gmBanRole.unban({ roleId: 1073 });
 * ```
 */
export class GMBanRole extends FireAndForgetProtocol implements FireAndForgetAction<{
  roleId: number;
  time: number;
  reason: string;
  gmRoleId?: number;
  ssid?: number;
}> {
  constructor(private readonly connection: GDeliveryConnection) {
    super(0x168); // 360
  }

  marshal(writer: BufferWriter, params: {
    roleId: number;
    time: number;
    reason: string;
    gmRoleId?: number;
    ssid?: number;
  }): void {
    writer.writeInt32BE(params.gmRoleId ?? -1);
    writer.writeUInt32BE(params.ssid ?? 0);
    writer.writeUInt32BE(params.roleId);
    writer.writeUInt32BE(params.time);
    writer.writeOctetsString(params.reason);
  }

  unmarshal(reader: BufferReader): void {
    // Protocol não espera resposta (fire and forget)
  }

  /**
   * Envia o protocolo para ban de personagem
   * Fire and forget - não espera resposta
   */
  async execute(params: {
    roleId: number;
    time: number;
    reason: string;
    gmRoleId?: number;
    ssid?: number;
  }): Promise<void> {
    const dataWriter = new BufferWriter();
    this.marshal(dataWriter, params);
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

