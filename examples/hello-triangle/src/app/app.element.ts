/// <reference types="@webgpu/types" />
import './app.style.css';

import { Runtime, RuntimeOptions } from '@gdy/runtime';
import { CommandEncoder, RenderPipeline, ShaderModule } from '@gdy/core';

import vert from '../assets/triangle.vert.wgsl?raw';
import frag from '../assets/triangle.frag.wgsl?raw';

export class Triangle {
  readonly pipeline: RenderPipeline;

  constructor() {
    const shader_vert = new ShaderModule({ code: vert });
    const shader_frag = new ShaderModule({ code: frag });

    this.pipeline = new RenderPipeline({
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

    const canvas = Runtime.getCanvas();

    // Resize the canvas to fill the screen.
    canvas.addEventListener('resize', this.draw.bind(this));
  }

  draw() {
    // Create a command encoder and pass it to our render pass.
    new CommandEncoder()

      // Begin a render pass.
      .beginRenderPass()

      // Set the pipeline to use for this render pass.
      .setPipeline(this.pipeline)
      .draw(3)
      .end()

      // Submit the command encoder to the GPU.
      .submit();
  }
}

const runtimeOptions: RuntimeOptions = {
  canvas: <HTMLCanvasElement>document.getElementById('canvas'),
  gpuRequestAdapterOptions: { powerPreference: 'high-performance' },
};

async function main() {
  await Runtime.initialize(runtimeOptions);

  const triangle = new Triangle();

  triangle.draw();
}

main();
