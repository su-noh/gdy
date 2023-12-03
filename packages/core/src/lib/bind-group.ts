import { Runtime } from '@gdy/runtime';

export interface IBindGroup {
  handle: GPUBindGroup;
}

export class BindGroup implements IBindGroup {
  readonly handle: GPUBindGroup;

  constructor(descriptor: GPUBindGroupDescriptor) {
    this.handle = Runtime.createBindGroup(descriptor);
  }
}
