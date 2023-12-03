export interface RuntimeOptions {
  canvas?: HTMLCanvasElement;
  gpuRequestAdapterOptions?: GPURequestAdapterOptions;
  gpuDeviceDescriptor?: GPUDeviceDescriptor;
}

/**
 * Represents a runtime environment for GPU-accelerated rendering.
 */
export class Runtime {
  private static _canvas: HTMLCanvasElement | null = null;
  private static _context: GPUCanvasContext | null = null;
  private static _format: GPUTextureFormat | null = null;
  private static _adapter: GPUAdapter | null = null;
  private static _device: GPUDevice | null = null;

  /**
   * Initializes the GPU rendering context by requesting the GPU adapter and device,
   * creating a canvas element, and configuring the GPU canvas context.
   * Also sets up a resize observer to handle canvas resizing.
   */
  static async initialize(options: RuntimeOptions = {}) {
    this._format = navigator.gpu.getPreferredCanvasFormat();

    this._adapter = <GPUAdapter>(
      await navigator.gpu.requestAdapter(options.gpuRequestAdapterOptions)
    );

    this._device = <GPUDevice>(
      await this._adapter.requestDevice(options.gpuDeviceDescriptor)
    );

    this._canvas = options.canvas ??= document.createElement('canvas');

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const canvas = entry.target;
        if (canvas instanceof HTMLCanvasElement) {
          const width = entry.contentBoxSize[0].inlineSize;
          const height = entry.contentBoxSize[0].blockSize;
          canvas.width = Math.max(
            1,
            Math.min(width, this.getDevice().limits.maxTextureDimension2D)
          );
          canvas.height = Math.max(
            1,
            Math.min(height, this.getDevice().limits.maxTextureDimension2D)
          );
          canvas.dispatchEvent(new Event('resize'));
        }
      }
    });
    observer.observe(this._canvas);

    this._context = <GPUCanvasContext>this._canvas.getContext('webgpu');
    this._context.configure({ device: this._device, format: this._format });
  }

  /**
   * Retrieves the device instance.
   * @returns The device instance.
   * @throws {Error} If the runtime is not initialized.
   */
  private static getDevice() {
    if (this._device === null) {
      throw new Error('Runtime not initialized');
    }

    return this._device;
  }

  /**
   * Gets the format of the runtime.
   * @returns The format of the runtime.
   * @throws {Error} If the runtime is not initialized.
   */
  static getFormat() {
    if (this._format === null) {
      throw new Error('Runtime not initialized');
    }

    return this._format;
  }

  /**
   * Creates a GPU buffer with the specified descriptor.
   * @param descriptor - The descriptor for the buffer.
   * @returns The created GPU buffer.
   */
  static createBuffer(descriptor: GPUBufferDescriptor) {
    return this.getDevice().createBuffer(descriptor);
  }

  /**
   * Writes data to a GPU buffer at the specified offset.
   *
   * @param buffer - The GPU buffer to write data to.
   * @param bufferOffset - The offset within the buffer to start writing data.
   * @param data - The data to write to the buffer.
   * @param dataOffset - The offset within the data to start writing from. Optional.
   * @param size - The number of bytes to write. Optional.
   */
  static writeBuffer(
    buffer: GPUBuffer,
    bufferOffset: GPUSize64,
    data: BufferSource | SharedArrayBuffer,
    dataOffset?: GPUSize64,
    size?: GPUSize64
  ) {
    this.getQueue().writeBuffer(buffer, bufferOffset, data, dataOffset, size);
  }

  /**
   * Creates a GPUCommandEncoder with the specified descriptor.
   * If no descriptor is provided, the default descriptor is used.
   * @param descriptor - The descriptor for the command encoder.
   * @returns A GPUCommandEncoder object.
   */
  static createCommandEncoder(descriptor?: GPUCommandEncoderDescriptor) {
    return this.getDevice().createCommandEncoder(descriptor);
  }

  /**
   * Returns the default render pass color attachment.
   * @returns The default render pass color attachment.
   */
  static getDefaultRenderPassColorAttachment(): GPURenderPassColorAttachment {
    return {
      view: Runtime.getCurrentTexture().createView(),
      loadOp: 'clear',
      storeOp: 'store',
    };
  }

  /**
   * Creates a GPU texture with the specified descriptor.
   * @param descriptor - The descriptor for the texture.
   * @returns The created GPU texture.
   */
  static createTexture(descriptor: GPUTextureDescriptor) {
    return this.getDevice().createTexture(descriptor);
  }

  /**
   * Retrieves the canvas element used by the runtime.
   * Throws an error if the runtime is not initialized.
   *
   * @returns The canvas element.
   * @throws Error if the runtime is not initialized.
   */
  static getCanvas() {
    if (this._canvas === null) {
      throw new Error('Runtime not initialized');
    }

    return this._canvas;
  }

  /**
   * Retrieves the queue from the device.
   *
   * @returns The queue from the device.
   */
  private static getQueue() {
    return this.getDevice().queue;
  }

  /**
   * Gets the current context.
   * @returns The current context.
   * @throws {Error} If the runtime is not initialized.
   */
  private static getContext() {
    if (this._context === null) {
      throw new Error('Runtime not initialized');
    }

    return this._context;
  }

  /**
   * Returns the current texture.
   * @returns The current texture.
   */
  static getCurrentTexture() {
    return this.getContext().getCurrentTexture();
  }

  /**
   * Creates a shader module using the provided descriptor.
   * @param descriptor - The descriptor for the shader module.
   * @returns The created shader module.
   */
  static createShaderModule(descriptor: GPUShaderModuleDescriptor) {
    return this.getDevice().createShaderModule(descriptor);
  }

  /**
   * Creates a bind group using the provided descriptor.
   * @param descriptor - The descriptor for the bind group.
   * @returns The created bind group.
   */
  static createBindGroup(descriptor: GPUBindGroupDescriptor) {
    return this.getDevice().createBindGroup(descriptor);
  }

  /**
   * Copies an external image to a texture.
   *
   * @param source - The external image to copy from.
   * @param destination - The texture to copy to.
   * @param copySize - The size of the copy operation.
   */
  static copyExternalImageToTexture(
    source: GPUImageCopyExternalImage,
    destination: GPUImageCopyTextureTagged,
    copySize: GPUExtent3DStrict
  ) {
    this.getQueue().copyExternalImageToTexture(source, destination, copySize);
  }

  /**
   * Creates a render pipeline with the specified descriptor.
   * @param descriptor - The descriptor for the render pipeline.
   * @returns The created render pipeline.
   */
  static createRenderPipeline(descriptor: GPURenderPipelineDescriptor) {
    return this.getDevice().createRenderPipeline(descriptor);
  }

  /**
   * Submits the given command buffers to the GPU queue for execution.
   *
   * @param commandBuffers - An iterable of GPUCommandBuffer objects to be submitted.
   */
  static submit(commandBuffers: Iterable<GPUCommandBuffer>) {
    this.getQueue().submit(commandBuffers);
  }
}
