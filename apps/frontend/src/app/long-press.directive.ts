import { Directive, ElementRef, EventEmitter, HostListener, inject, Input, OnDestroy, Output, Renderer2 } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { Router } from '@angular/router';

@Directive({
  selector: '[lhLongPress]',
})
export class LongPressDirective implements OnDestroy {
  // 1. Pass the link directly to the directive
  @Input() lhLongPressLink: string | any[] = '';
  @Output() longPress = new EventEmitter<void>();

  private router = inject(Router);
  private renderer = inject(Renderer2);
  private el = inject(ElementRef);

  private readonly threshold = 500;
  private timerSub?: Subscription;
  private isLongPressing = false;
  private touchStarted = false; // Prevents "double firing" on mobile-hybrid devices

  constructor() {
    this.applyStyles();
  }

  // --- START EVENTS ---
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStarted = true;
    this.initiatePress(event);
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (this.touchStarted) return; // Ignore mouse events if touch already started
    this.initiatePress(event);
  }

  private initiatePress(event: Event) {
    this.isLongPressing = false;

    // Stop Safari preview on mobile
    if (event instanceof TouchEvent && event.cancelable) {
      event.preventDefault();
    }

    this.timerSub = timer(this.threshold).subscribe(() => {
      this.isLongPressing = true;
      this.longPress.emit();
      this.hapticFeedback();
    });
  }

  // --- END EVENTS ---
  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    this.finalizePress();
    this.touchStarted = false;
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if (this.touchStarted) return;
    this.finalizePress();
  }

  private finalizePress() {
    // If we released BEFORE the timer finished, it's a normal click/tap
    if (!this.isLongPressing) {
      this.navigate();
    }
    this.clearTimer();
  }

  // --- CANCELLATION ---
  @HostListener('touchmove')
  @HostListener('mouseleave')
  onLeave() {
    this.clearTimer();
  }

  // --- HELPERS ---
  private navigate() {
    if (!this.lhLongPressLink) return;

    if (Array.isArray(this.lhLongPressLink)) {
      this.router.navigate(this.lhLongPressLink);
    } else {
      this.router.navigateByUrl(this.lhLongPressLink);
    }
  }

  private applyStyles() {
    const styles = {
      '-webkit-touch-callout': 'none',
      '-webkit-user-select': 'none',
      'user-select': 'none',
      cursor: 'pointer',
    };
    Object.entries(styles).forEach(([prop, val]) => {
      this.renderer.setStyle(this.el.nativeElement, prop, val);
    });
  }

  private hapticFeedback() {
    if ('vibrate' in navigator) navigator.vibrate(40);
  }

  private clearTimer() {
    this.timerSub?.unsubscribe();
  }

  ngOnDestroy() {
    this.clearTimer();
  }
}
