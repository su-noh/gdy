/// <reference types="@webgpu/types" />
import './app.style.css';

import * as GDY from '@gdy/core';

import vert from '../assets/triangle.vert.wgsl?raw';
import frag from '../assets/triangle.frag.wgsl?raw';

export class Triangle {
  private pipeline: GDY.RenderPipeline;
  private renderTarget: GDY.Texture;

  constructor() {
    const canvas = GDY.Runtime.canvas;

    const sampleCount = 4;

    this.renderTarget = new GDY.Texture({
      size: GDY.Runtime.size,
      format: GDY.Runtime.format,

      sampleCount: sampleCount,

      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    const shader_vert = new GDY.ShaderModule({ code: vert });
    const shader_frag = new GDY.ShaderModule({ code: frag });

    this.pipeline = new GDY.RenderPipeline({
      layout: 'auto',
      vertex: {
        module: shader_vert.handle,
        entryPoint: 'main',
      },
      fragment: {
        module: shader_frag.handle,
        targets: [{ format: GDY.Runtime.format }],
        entryPoint: 'main',
      },
      primitive: {
        topology: 'triangle-list',
      },
      multisample: {
        count: sampleCount,
      },
    });

    // Resize the canvas to fill the screen.
    canvas.addEventListener('resize', () => {
      this.renderTarget.resize([canvas.width, canvas.height]);
      this.draw();
    });
  }

  draw() {
    // Create a command encoder and pass it to our render pass.
    new GDY.CommandEncoder()

      // Begin a render pass.
      .beginRenderPass({
        colorAttachments: [
          {
            view: this.renderTarget.getViewInstance(),
            resolveTarget: GDY.Runtime.currentTexture.createView(),
            loadOp: 'clear',
            storeOp: 'discard',
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
          },
        ],
      })

      // Set the pipeline to use for this render pass.
      .setPipeline(this.pipeline)
      .draw(3)
      .end()

      // Submit the command encoder to the GPU.
      .submit();
  }
}

const runtimeOptions: GDY.RuntimeOptions = {
  canvas: <HTMLCanvasElement>document.getElementById('canvas'),
  gpuRequestAdapterOptions: { powerPreference: 'high-performance' },
  alphaMode: 'premultiplied',
};

async function main() {
  await GDY.Runtime.initialize(runtimeOptions);

  const triangle = new Triangle();

  triangle.draw();
}

main();
