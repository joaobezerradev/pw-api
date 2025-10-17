import { FireAndForgetProtocol, BufferWriter, BufferReader } from '../core';

/**
 * Protocol GMShutup - Type 0x164 (356 decimal)  
 * Mute de personagem (desabilita chat)
 * Porta: 29100 (GDELIVERYD)
 * 
 * NOTA: O código PHP usa este protocolo para mutar role, 
 * mas o XML indica que é para mutar conta (dstuserid)
 */
export class GMMuteRole extends FireAndForgetProtocol {
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
    super(0x164); // 356
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
   * Envia o protocolo para mute de personagem
   * Fire and forget - não espera resposta
   */
  static async send(host: string, port: number, params: {
    roleId: number;
    time: number;
    reason: string;
  }): Promise<void> {
    const protocol = new GMMuteRole(params);
    return this.sendProtocol(host, port, protocol);
  }

  /**
   * Remove o mute de um personagem (unmute)
   * Envia o mesmo protocolo com time=0 para remover o mute
   */
  static async unmute(host: string, port: number, params: {
    roleId: number;
    reason?: string;
  }): Promise<void> {
    return GMMuteRole.send(host, port, {
      roleId: params.roleId,
      time: 0, // time=0 remove o mute
      reason: params.reason || 'Mute removido'
    });
  }
}

