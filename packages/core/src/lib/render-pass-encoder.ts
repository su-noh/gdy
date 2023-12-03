import type { BindGroup } from './bind-group';
import type { CommandEncoder } from './command-encoder';
import type { RenderPipeline } from './render-pipeline';

export class RenderPassEncoder {
  readonly handle: GPURenderPassEncoder;

  constructor(
    readonly commandEncoder: CommandEncoder,
    descriptor: GPURenderPassDescriptor
  ) {
    this.handle = commandEncoder.handle.beginRenderPass(descriptor);
  }

  setPipeline(pipeline: RenderPipeline): this {
    this.handle.setPipeline(pipeline.handle);
    return this;
  }

  setBindGroup(index: number, bindGroup: BindGroup): this {
    this.handle.setBindGroup(index, bindGroup.handle);
    return this;
  }

  draw(
    vertexCount: GPUSize32,
    instanceCount?: GPUSize32,
    firstVertex?: GPUSize32,
    firstInstance?: GPUSize32
  ): this {
    this.handle.draw(vertexCount, instanceCount, firstVertex, firstInstance);
    return this;
  }

  drawIndexed(
    indexCount: GPUSize32,
    instanceCount?: GPUSize32,
    firstIndex?: GPUSize32,
    baseVertex?: GPUSignedOffset32,
    firstInstance?: GPUSize32
  ): this {
    this.handle.drawIndexed(
      indexCount,
      instanceCount,
      firstIndex,
      baseVertex,
      firstInstance
    );
    return this;
  }

  drawIndirect(indirectBuffer: GPUBuffer, indirectOffset: GPUSize64): this {
    this.handle.drawIndirect(indirectBuffer, indirectOffset);
    return this;
  }

  end() {
    this.handle.end();
    return this.commandEncoder;
  }
}
