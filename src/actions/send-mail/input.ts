/**
 * Input para SendMail Action (SysSendMail - type 4214)
 */
import { MailAttachItem } from '../../models/mail.model';

export type SendMailInput = {
  tid: number;              // unsigned int - Transaction ID
  sysid: number;            // int - System ID (sender_id = 32)
  sys_type: number;         // unsigned char - Tipo do sender (3 = system)
  receiver: number;         // int - ID do receptor (roleid)
  title: string;            // Octets - Título do email
  context: string;          // Octets - Conteúdo (max 400 bytes)
  attach_obj: MailAttachItem; // GRoleInventory - Item anexado
  attach_money: number;     // unsigned int - Gold anexado
};
