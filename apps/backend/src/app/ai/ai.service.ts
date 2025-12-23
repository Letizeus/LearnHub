import { Injectable } from '@nestjs/common';
import ollama from 'ollama';
import fs from 'fs';
import sharp from 'sharp';

@Injectable()
export class AiService {
  private baseUrl: string;
  private promptMoondream: string;
  constructor() {
    this.baseUrl = `http://localhost:${process.env.OLLAMA_PORT}/api`;
    this.promptMoondream =
      "First, describe the visual content of the image. Second, list all text found in the image using the prefix 'TEXT: '.";
  }

  async isAvailable() {
    return Boolean(await ollama.list());
  }

  /**
   * Converts an array of file paths to a specific document format.
   *
   * @param images - An array of base64 encodeded images
   * @returns The converted document(s) in the desired format.
   */
  async convertToDocumentFormat(images: string[]) {
    console.log('trying');
    try {
      const res = await ollama.chat({
        model: 'granite3.2-vision:latest',
        messages: [
          {
            role: 'user',
            content: this.promptMoondream,
            images,
          },
        ],
        options: {
          temperature: 0.1,
          num_ctx: 4096,
        },
      });
      console.log(res);
      return res;
    } catch (error) {
      console.error(error);
    }
  }
}
