import { Buffer } from 'node:buffer';

/**
 * BufferReader - Classe para ler dados em big-endian
 */
export class BufferReader {
  private buffer: Buffer;
  private offset: number = 0;

  constructor(buffer: Buffer) {
    this.buffer = buffer;
  }

  /**
   * Retorna o offset atual
   */
  getOffset(): number {
    return this.offset;
  }

  /**
   * Define o offset
   */
  setOffset(offset: number): void {
    this.offset = offset;
  }

  /**
   * Verifica se há mais dados para ler
   */
  hasMore(): boolean {
    return this.offset < this.buffer.length;
  }

  /**
   * Retorna o tamanho do buffer
   */
  size(): number {
    return this.buffer.length;
  }

  /**
   * Lê um byte (int8)
   */
  readInt8(): number {
    const value = this.buffer.readInt8(this.offset);
    this.offset += 1;
    return value;
  }

  /**
   * Lê um unsigned byte (uint8)
   */
  readUInt8(): number {
    const value = this.buffer.readUInt8(this.offset);
    this.offset += 1;
    return value;
  }

  /**
   * Lê um short (int16) em big-endian
   */
  readInt16BE(): number {
    const value = this.buffer.readInt16BE(this.offset);
    this.offset += 2;
    return value;
  }

  /**
   * Lê um unsigned short (uint16) em big-endian
   */
  readUInt16BE(): number {
    const value = this.buffer.readUInt16BE(this.offset);
    this.offset += 2;
    return value;
  }

  /**
   * Lê um int (int32) em big-endian
   */
  readInt32BE(): number {
    const value = this.buffer.readInt32BE(this.offset);
    this.offset += 4;
    return value;
  }

  /**
   * Lê um unsigned int (uint32) em big-endian
   */
  readUInt32BE(): number {
    const value = this.buffer.readUInt32BE(this.offset);
    this.offset += 4;
    return value;
  }

  /**
   * Lê um float em big-endian
   */
  readFloatBE(): number {
    const value = this.buffer.readFloatBE(this.offset);
    this.offset += 4;
    return value;
  }

  /**
   * Lê um double em big-endian
   */
  readDoubleBE(): number {
    const value = this.buffer.readDoubleBE(this.offset);
    this.offset += 8;
    return value;
  }

  /**
   * Lê um CompactUINT (formato especial do servidor)
   * Tamanho variável: 1-5 bytes (Big-Endian)
   */
  readCompactUINT(): number {
    const firstByte = this.readUInt8();
    if ((firstByte & 0x80) === 0) {
      // 1 byte: 0xxxxxxx
      return firstByte;
    } else if ((firstByte & 0xC0) === 0x80) {
      // 2 bytes: 10xxxxxx xxxxxxxx
      const secondByte = this.readUInt8();
      return ((firstByte & 0x3F) << 8) | secondByte;
    } else if ((firstByte & 0xE0) === 0xC0) {
      // 4 bytes: 110xxxxx xxxxxxxx xxxxxxxx xxxxxxxx
      const byte2 = this.readUInt8();
      const byte3 = this.readUInt8();
      const byte4 = this.readUInt8();
      return ((firstByte & 0x1F) << 24) | (byte2 << 16) | (byte3 << 8) | byte4;
    } else {
      // 5 bytes: 111xxxxx + uint32
      return this.readUInt32BE();
    }
  }

  /**
   * Lê um array de bytes (Octets)
   */
  readOctets(): Buffer {
    const length = this.readCompactUINT();
    const data = this.buffer.subarray(this.offset, this.offset + length);
    this.offset += length;
    return data;
  }

  /**
   * Lê Octets e converte para string UTF-16LE
   */
  readOctetsAsString(): string {
    const octets = this.readOctets();
    if (octets.length === 0) {
      return '';
    }
    return octets.toString('utf16le');
  }

  /**
   * Lê uma string UTF-16LE (formato usado pelo servidor)
   */
  readString(): string {
    const length = this.readCompactUINT();
    if (length === 0) return '';
    const data = this.buffer.toString('utf16le', this.offset, this.offset + length);
    this.offset += length;
    return data;
  }

  /**
   * Lê um número específico de bytes
   */
  readBytes(length: number): Buffer {
    const data = this.buffer.subarray(this.offset, this.offset + length);
    this.offset += length;
    return data;
  }

  /**
   * Lê todos os bytes restantes
   */
  readRemainingBytes(): Buffer {
    const data = this.buffer.subarray(this.offset);
    this.offset = this.buffer.length;
    return data;
  }

  /**
   * Lê int64 (8 bytes, Big-Endian)
   */
  readInt64BE(): bigint {
    const value = this.buffer.readBigInt64BE(this.offset);
    this.offset += 8;
    return value;
  }
}
