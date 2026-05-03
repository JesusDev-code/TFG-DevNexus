import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import { AuthService } from 'src/app/services/auth.service'; 
import {
  AnimationController,
  IonModal,
  Platform,
  IonImg,
  IonText,
  IonButtons,
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { person, arrowForwardOutline, closeOutline } from 'ionicons/icons';

import { RiveCanvas, RiveLinearAnimation, RivePlayer } from 'ng-rive';
import { SignInComponent } from './sign-in/sign-in.component';

@Component({
  selector: 'cr-on-boarding',
  templateUrl: './on-boarding.page.html',
  styleUrls: ['./on-boarding.page.scss'],
  standalone: true,
  imports: [
    IonImg,
    IonText,
    IonButton,
    IonButtons,
    IonModal,
    IonIcon,
    CommonModule,
    FormsModule,
    RiveCanvas,
    RiveLinearAnimation,
    RivePlayer,
    SignInComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnBoardingPage implements OnInit {
  @ViewChild(IonModal) signInModal?: IonModal;
  @ViewChild('container', { read: ElementRef }) containerRef?: ElementRef;
  @ViewChild('closeBtn', { read: ElementRef }) closeBtnRef?: ElementRef;

  @Output() closeOnBoardingEvent = new EventEmitter();

  // Variables de control
  buttonToggle = false; 
  showRiveAsset = false;

  public authService = inject(AuthService);
  public router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  public platform = inject(Platform);
  private animationCtrl = inject(AnimationController);

  constructor() {
    addIcons({ person, arrowForwardOutline, closeOutline });
  }

  ngOnInit() {
    // Retraso para que el fondo no compita con la carga inicial, 
    // pero el botón ya estará visible por CSS.
    setTimeout(() => { this.showRiveAsset = true; this.cdr.markForCheck(); }, 500);
  }

  startCoursePressed() {
    // 1. Activamos animación del botón
    this.buttonToggle = true; 
    
    // 2. Esperamos un poco y abrimos el modal
    setTimeout(() => {
      this.signInModal?.present();
    }, 800);
  }

  onSignInClose() {
    this.signInModal?.dismiss();
    // Simplemente desactivamos el toggle.
    // Al no destruir el componente, no hay parpadeo.
    // 'autoreset' en el HTML se encarga de volver al frame 0 suavemente si terminó.
    this.buttonToggle = false; 
  }

  goToProfile() {
    this.router.navigate(['/user-profile']);
  }

  onCloseOnBoarding() {
    this.closeOnBoardingEvent.emit();
  }

  // --- ANIMACIONES DEL MODAL (Sin cambios) ---
  enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;
    const containerEl = this.containerRef?.nativeElement;

    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root?.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root?.querySelector('.modal-wrapper')!)
      .beforeStyles({ 'will-change': 'transform, opacity' })
      .keyframes([
        { offset: 0, opacity: '0.5', transform: 'translateY(-100vh)' },
        { offset: 1, opacity: '1', transform: 'translateY(0vh)' },
      ])
      .afterClearStyles(['will-change']);

    const onBoardingContent = this.animationCtrl
      .create()
      .addElement(containerEl!)
      .beforeStyles({ 'will-change': 'transform' })
      .keyframes([
        { offset: 0, transform: 'translateY(0px)' },
        { offset: 1, transform: 'translateY(-50px)' },
      ])
      .afterClearStyles(['will-change']);

    const closeBtnAnim = this.animationCtrl
      .create()
      .addElement(this.closeBtnRef?.nativeElement!)
      .beforeStyles({ 'will-change': 'transform' })
      .fromTo('transform', 'translateY(0)', 'translateY(-150px)')
      .afterClearStyles(['will-change']);

    return this.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('cubic-bezier(0.32, 0.72, 0, 1)')
      .duration(500)
      .addAnimation([
        backdropAnimation,
        wrapperAnimation,
        onBoardingContent,
        closeBtnAnim,
      ]);
  };

  leaveAnimation = (baseEl: HTMLElement) => {
    return this.enterAnimation(baseEl).direction('reverse');
  };
}