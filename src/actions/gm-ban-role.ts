import { FireAndForgetProtocol, BufferWriter, BufferReader } from '../core';

/**
 * Protocol GMKickoutRole - Type 0x168 (360 decimal)
 * Ban de personagem (role)
 * Porta: 29100 (GDELIVERYD)
 */
export class GMBanRole extends FireAndForgetProtocol {
  private gmRoleId: number;
  private ssid: number;
  private roleId: number;
  private time: number;
  private reason: string;

  constructor(params: {
    roleId: number;
    time: number;
    reason: string;
    gmRoleId?: number;
    ssid?: number;
  }) {
    super(0x168); // 360
    this.gmRoleId = params.gmRoleId ?? -1;
    this.ssid = params.ssid ?? 0;
    this.roleId = params.roleId;
    this.time = params.time;
    this.reason = params.reason;
  }

  marshal(writer: BufferWriter): void {
    writer.writeInt32BE(this.gmRoleId);
    writer.writeUInt32BE(this.ssid);
    writer.writeUInt32BE(this.roleId);
    writer.writeUInt32BE(this.time);
    writer.writeOctetsString(this.reason);
  }

  unmarshal(reader: BufferReader): void {
    // Protocol não espera resposta (fire and forget)
  }

  /**
   * Envia o protocolo para ban de personagem
   * Fire and forget - não espera resposta
   */
  static async send(host: string, port: number, params: {
    roleId: number;
    time: number;
    reason: string;
  }): Promise<void> {
    const protocol = new GMBanRole(params);
    return this.sendProtocol(host, port, protocol);
  }

  /**
   * Remove o ban de um personagem (unban)
   * Envia o mesmo protocolo com time=0 para remover o ban
   */
  static async unban(host: string, port: number, params: {
    roleId: number;
    reason?: string;
  }): Promise<void> {
    return GMBanRole.send(host, port, {
      roleId: params.roleId,
      time: 0, // time=0 remove o ban
      reason: params.reason || 'Ban removido'
    });
  }
}

