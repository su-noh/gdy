import { Runtime } from '@gdy/runtime';

export class ShaderModule {
  readonly handle: GPUShaderModule;

  constructor(descriptor: GPUShaderModuleDescriptor) {
    this.handle = Runtime.device.createShaderModule(descriptor);
  }
}
