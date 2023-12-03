import { Runtime } from '@gdy/runtime';
import { RenderPassEncoder } from './render-pass-encoder';

export interface ICommandEncoder {
  handle: GPUCommandEncoder;
}

export class CommandEncoder implements ICommandEncoder {
  readonly handle: GPUCommandEncoder;

  constructor(descriptor?: GPUCommandEncoderDescriptor) {
    this.handle = Runtime.createCommandEncoder(descriptor);
  }

  beginRenderPass(
    descriptor: GPURenderPassDescriptor = {
      colorAttachments: [Runtime.getDefaultRenderPassColorAttachment()],
    }
  ) {
    return new RenderPassEncoder(this, descriptor);
  }

  submit(): void {
    Runtime.submit([this.handle.finish()]);
  }
}
