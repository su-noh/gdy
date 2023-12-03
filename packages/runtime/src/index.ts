export class Runtime {
  private static _canvas: HTMLCanvasElement | null = null;
  private static _context: GPUCanvasContext | null = null;
  private static _format: GPUTextureFormat | null = null;
  private static _adapter: GPUAdapter | null = null;
  private static _device: GPUDevice | null = null;

  static getFormat() {
    if (this._format === null) {
      throw new Error('Runtime not initialized');
    }

    return this._format;
  }

  private static getDevice() {
    if (this._device === null) {
      throw new Error('Runtime not initialized');
    }

    return this._device;
  }

  static createBuffer(descriptor: GPUBufferDescriptor) {
    return this.getDevice().createBuffer(descriptor);
  }

  static writeBuffer(
    buffer: GPUBuffer,
    bufferOffset: GPUSize64,
    data: BufferSource | SharedArrayBuffer,
    dataOffset?: GPUSize64,
    size?: GPUSize64
  ) {
    this.getQueue().writeBuffer(buffer, bufferOffset, data, dataOffset, size);
  }

  static createCommandEncoder(descriptor: GPUCommandEncoderDescriptor) {
    return this.getDevice().createCommandEncoder(descriptor);
  }

  static createTexture(descriptor: GPUTextureDescriptor) {
    return this.getDevice().createTexture(descriptor);
  }

  static getCanvas() {
    if (this._canvas === null) {
      throw new Error('Runtime not initialized');
    }

    return this._canvas;
  }

  private static getQueue() {
    return this.getDevice().queue;
  }

  private static getContext() {
    if (this._context === null) {
      throw new Error('Runtime not initialized');
    }

    return this._context;
  }

  static getCurrentTexture() {
    return this.getContext().getCurrentTexture();
  }

  static createShaderModule(descriptor: GPUShaderModuleDescriptor) {
    return this.getDevice().createShaderModule(descriptor);
  }
  static createBindGroup(descriptor: GPUBindGroupDescriptor) {
    return this.getDevice().createBindGroup(descriptor);
  }
  static copyExternalImageToTexture(
    source: GPUImageCopyExternalImage,
    destination: GPUImageCopyTextureTagged,
    copySize: GPUExtent3DStrict
  ) {
    this.getQueue().copyExternalImageToTexture(source, destination, copySize);
  }

  static createRenderPipeline(descriptor: GPURenderPipelineDescriptor) {
    return this.getDevice().createRenderPipeline(descriptor);
  }

  static submit(commandBuffers: Iterable<GPUCommandBuffer>) {
    this.getQueue().submit(commandBuffers);
  }

  static async initialize() {
    this._format = navigator.gpu.getPreferredCanvasFormat();

    this._adapter = <GPUAdapter>await navigator.gpu.requestAdapter();
    this._device = <GPUDevice>await this._adapter.requestDevice();

    this._canvas = document.createElement('canvas');

    this._context = <GPUCanvasContext>this._canvas.getContext('webgpu');
    this._context.configure({ device: this._device, format: this._format });
  }

  static uninitialize() {
    this._device?.destroy();

    this._format = null;
    this._adapter = null;
    this._device = null;
  }
}
