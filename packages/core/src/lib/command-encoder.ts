import { Runtime } from '@gdy/runtime';
import { RenderPassEncoder } from './render-pass-encoder';

export interface ICommandEncoder {
  handle: GPUCommandEncoder;
}

export class CommandEncoder implements ICommandEncoder {
  readonly handle: GPUCommandEncoder;

  constructor(descriptor?: GPUCommandEncoderDescriptor) {
    this.handle = Runtime.device.createCommandEncoder(descriptor);
  }

  beginRenderPass(descriptor: GPURenderPassDescriptor) {
    return new RenderPassEncoder(this, descriptor);
  }

  submit(): void {
    Runtime.queue.submit([this.handle.finish()]);
  }
}
