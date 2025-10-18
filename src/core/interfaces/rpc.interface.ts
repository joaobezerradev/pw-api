import { BufferWriter } from '../buffer-writer';
import { BufferReader } from '../buffer-reader';

/**
 * Interface para RPCs (protocolos com resposta)
 * Usado para ações que enviam e recebem dados
 */
export interface RpcAction<TInput, TOutput> {
  /**
   * Executa o RPC e retorna a resposta
   */
  execute(input: TInput): Promise<TOutput>;

  /**
   * Serializa os argumentos de entrada
   */
  marshalArgument(writer: BufferWriter, input: TInput): void;

  /**
   * Deserializa o resultado recebido
   */
  unmarshalResult(reader: BufferReader): void;

  /**
   * Retorna o tipo do protocolo
   */
  getType(): number;
}

