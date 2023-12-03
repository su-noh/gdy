import { Runtime } from '@gdy/runtime';

export class Texture {
  /**
   * Creates a texture from the specified URL.
   * @param url The URL of the image.
   * @returns A promise that resolves to the created texture.
   */
  static async fromURL(
    url: string,
    format: GPUTextureFormat,
    usage: GPUTextureUsageFlags
  ) {
    const response = await fetch(url);
    const source = await createImageBitmap(await response.blob());

    return Texture.fromImageSource(source, format, usage);
  }

  /**
   * Gets the size of the GPUImageCopyExternalImageSource.
   * @param source The source image to get the size from.
   * @returns The size of the image as a GPUExtent3DStrict object.
   */
  static getSizeFromImageSource(
    source: GPUImageCopyExternalImageSource
  ): GPUExtent3DStrict {
    let size: GPUExtent3DStrict;

    if (
      source instanceof ImageBitmap ||
      source instanceof ImageData ||
      source instanceof HTMLImageElement ||
      source instanceof HTMLVideoElement ||
      source instanceof HTMLCanvasElement ||
      source instanceof OffscreenCanvas
    ) {
      size = [source.width, source.height, 1];
    } else {
      size = [source.codedWidth, source.codedHeight, 1];
    }

    return size;
  }

  /**
   * Creates a new Texture object from the given source.
   *
   * @param source - The source image or canvas element.
   * @returns A new Texture object.
   */
  static fromImageSource(
    source: GPUImageCopyExternalImageSource,
    format: GPUTextureFormat,
    usage: GPUTextureUsageFlags
  ) {
    const size = Texture.getSizeFromImageSource(source);

    return new Texture({ size, format, usage }).copy({ source, flipY: true });
  }

  /**
   * The handle for the GPU texture.
   * @private
   */
  private _handle: GPUTexture | null;

  /**
   * The source of the texture.
   * @private
   */
  private _source: GPUImageCopyExternalImage | null = null;

  /**
   * The GPUTextureView associated with the texture.
   */
  private _viewInstance: GPUTextureView | null = null;

  constructor(protected descriptor: GPUTextureDescriptor) {
    const texture = Runtime.device.createTexture(descriptor);

    this._handle = texture;
  }

  /**
   * Copies the contents of an external image to the texture.
   *
   * @param source The external image to copy from.
   * @returns The updated texture instance.
   */
  copy(source: GPUImageCopyExternalImage): this {
    if (this._handle === null) {
      throw new Error('Texture is destoryed');
    }

    this._source = source;

    const destination: GPUImageCopyTextureTagged = {
      texture: this._handle,
    };

    const size: GPUExtent3DStrict = [this._handle.width, this._handle.height];

    Runtime.queue.copyExternalImageToTexture(source, destination, size);

    return this;
  }

  /**
   * Resizes the texture to the specified size.
   * @param size The new size of the texture.
   */
  resize(size: GPUExtent3DStrict) {
    if (this._handle === null) {
      throw new Error('Texture is destoryed');
    }

    this.descriptor.size = size;

    const texture = Runtime.device.createTexture(this.descriptor);

    this._handle.destroy();
    this._handle = texture;

    if (this._viewInstance) {
      this._viewInstance = this._handle.createView();
    }

    if (this._source) {
      this.copy(this._source);
    }
  }

  /**
   * Returns the view instance of the texture.
   * If the view instance is not created yet, it will be created and cached.
   * @returns The view instance of the texture.
   */
  getViewInstance() {
    return (this._viewInstance ||= this.createView());
  }

  /**
   * Creates a view for the texture.
   * @returns The created view.
   */
  createView(descriptor?: GPUTextureViewDescriptor): GPUTextureView {
    if (this._handle === null) {
      throw new Error('Texture is destoryed');
    }

    return this._handle.createView(descriptor);
  }

  /**
   * Destroys the texture handle.
   */
  destory() {
    if (this._handle) {
      this._handle.destroy();
      this._handle = null;
    }
  }
}
