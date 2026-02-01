import { Pipe, PipeTransform } from '@angular/core';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import katex from 'katex';

@Pipe({
  name: 'math'
})
export class MathPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';

    // 1. Handle Block Math: $$...$$ or \[...\]
    let replacedText = value.replace(/\$\$(.*?)\$\$/g, (m, equation) =>
        katex.renderToString(equation, {displayMode: true, throwOnError: false})
    );
    replacedText = replacedText.replace(/\\\[(.*?)\\\]/g, (m, equation) =>
        katex.renderToString(equation, {displayMode: true, throwOnError: false})
    );

    // 2. Handle Inline Math: $...$ or \(...\)
    replacedText = replacedText.replace(/\$(.*?)\$/g, (m, equation) =>
        katex.renderToString(equation, {displayMode: false, throwOnError: false})
    );
    replacedText = replacedText.replace(/\\\((.*?)\\\)/g, (m, equation) =>
        katex.renderToString(equation, {displayMode: false, throwOnError: false})
    );

    return this.sanitizer.bypassSecurityTrustHtml(replacedText);
  }
}