/// <reference types="@webgpu/types" />
import './app.style.css';
import { Runtime } from '@gdy/runtime';

import vert from '../assets/triangle.vert.wgsl?raw';
import frag from '../assets/triangle.frag.wgsl?raw';
import { RenderPipeline, ShaderModule } from '@gdy/core';

export class Triangle {
  static async create() {
    await Runtime.initialize({
      canvas: <HTMLCanvasElement>document.getElementById('canvas'),
      gpuRequestAdapterOptions: { powerPreference: 'high-performance' },
    });

    const shader_vert = new ShaderModule({ code: vert });
    const shader_frag = new ShaderModule({ code: frag });

    const { handle } = new RenderPipeline({
      layout: 'auto',
      vertex: {
        module: shader_vert.handle,
        entryPoint: 'main',
      },
      fragment: {
        module: shader_frag.handle,
        targets: [{ format: Runtime.getFormat() }],
        entryPoint: 'main',
      },
      primitive: {
        topology: 'triangle-list',
      },
    });

    return new Triangle(handle);
  }

  constructor(readonly pipeline: GPURenderPipeline) {
    Runtime.getCanvas().addEventListener('resize', () => {
      this.draw();
    });
  }

  draw() {
    const commandEncoder = Runtime.createCommandEncoder();

    const renderPassEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: Runtime.getCurrentTexture().createView(),
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    });

    renderPassEncoder.setPipeline(this.pipeline);
    renderPassEncoder.draw(3);
    renderPassEncoder.end();

    Runtime.submit([commandEncoder.finish()]);
  }
}

Triangle.create().then((triangle) => {
  triangle.draw();
});
