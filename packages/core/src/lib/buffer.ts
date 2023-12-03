import { Runtime } from '@gdy/runtime';

/**
 * Represents a GPU buffer.
 */
export class Buffer {
  private _handle: GPUBuffer | null = null;

  /**
   * Creates a new Buffer instance.
   * @param descriptor - The descriptor for creating the GPU buffer.
   */
  constructor(protected descriptor: GPUBufferDescriptor) {
    this._handle = Runtime.device.createBuffer(descriptor);
  }

  /**
   * Gets the handle of the GPU buffer.
   * @throws Error if the buffer is destroyed.
   * @returns The handle of the GPU buffer.
   */
  get handle() {
    if (this._handle === null) {
      throw new Error('Buffer is destroyed');
    }

    return this._handle;
  }

  /**
   * Writes data to the GPU buffer.
   * @param data - The data to be written to the buffer.
   * @throws Error if the buffer is destroyed.
   */
  write(data: BufferSource | SharedArrayBuffer) {
    if (this._handle === null) {
      throw new Error('Buffer is destroyed');
    }

    Runtime.queue.writeBuffer(this._handle, 0, data);
  }

  /**
   * Destroys the GPU buffer.
   */
  destroy() {
    this._handle?.destroy();
    this._handle = null;
  }
}
