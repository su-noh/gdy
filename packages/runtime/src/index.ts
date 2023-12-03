/**
 * Represents the options for the runtime.
 */
/**
 * Represents the options for the runtime.
 */
export interface RuntimeOptions {
  /**
   * The canvas element to be used by the runtime.
   */
  canvas?: HTMLCanvasElement;

  /**
   * The options for requesting a GPU adapter.
   */
  gpuRequestAdapterOptions?: GPURequestAdapterOptions;

  /**
   * The descriptor for the GPU device.
   */
  gpuDeviceDescriptor?: GPUDeviceDescriptor;

  /**
   * The alpha mode for the canvas.
   */
  alphaMode?: GPUCanvasAlphaMode;
}

/**
 * Represents the runtime for GPU rendering.
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
   *
   * @param options - The options for initializing the runtime.
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
            Math.min(width, this.device.limits.maxTextureDimension2D)
          );
          canvas.height = Math.max(
            1,
            Math.min(height, this.device.limits.maxTextureDimension2D)
          );
          canvas.dispatchEvent(new Event('resize'));
        }
      }
    });
    observer.observe(this._canvas);

    this._context = <GPUCanvasContext>this._canvas.getContext('webgpu');
    this._context.configure({
      device: this._device,
      format: this._format,
      alphaMode: options.alphaMode,
    });
  }

  /**
   * Retrieves the device instance.
   *
   * @returns The device instance.
   * @throws {Error} If the runtime is not initialized.
   */
  static get device() {
    if (this._device === null) {
      throw new Error('Runtime not initialized');
    }

    return this._device;
  }

  /**
   * Gets the format of the runtime.
   *
   * @returns The format of the runtime.
   * @throws {Error} If the runtime is not initialized.
   */
  static get format() {
    if (this._format === null) {
      throw new Error('Runtime not initialized');
    }

    return this._format;
  }

  /**
   * Gets the size of the runtime.
   *
   * @returns The size of the runtime.
   */
  static get size(): GPUExtent3DStrict {
    return [this.canvas.width, this.canvas.height];
  }

  /**
   * Retrieves the canvas element used by the runtime.
   * Throws an error if the runtime is not initialized.
   *
   * @returns The canvas element.
   * @throws Error if the runtime is not initialized.
   */
  static get canvas() {
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
  static get queue() {
    return this.device.queue;
  }

  /**
   * Gets the current context.
   *
   * @returns The current context.
   * @throws {Error} If the runtime is not initialized.
   */
  static get context() {
    if (this._context === null) {
      throw new Error('Runtime not initialized');
    }

    return this._context;
  }

  /**
   * Returns the current texture.
   *
   * @returns The current texture.
   */
  static get currentTexture() {
    return this.context.getCurrentTexture();
  }
}
