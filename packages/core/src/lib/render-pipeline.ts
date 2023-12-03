import { Runtime } from '@gdy/runtime';

export interface IRenderPipeline {
  handle: GPURenderPipeline;
}

export class RenderPipeline implements IRenderPipeline {
  readonly handle: GPURenderPipeline;

  constructor(descriptor: GPURenderPipelineDescriptor) {
    this.handle = Runtime.device.createRenderPipeline(descriptor);
  }
}
