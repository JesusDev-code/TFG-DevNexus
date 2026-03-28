// ✅ SE AÑADIÓ HostListener A LOS IMPORTS
import { Component, ElementRef, OnInit, ViewChild, inject, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import {
  IonContent, IonText, IonIcon, AnimationController, Animation,
  IonFab, IonFabButton, ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { filter } from 'rxjs/operators';
import {
  arrowForwardOutline,
  closeOutline,
  exitOutline,
  personOutline,
  logOutOutline,
  menuOutline,
  chatbubblesOutline
} from 'ionicons/icons';

import { SideMenuComponent } from '../pages/dashboard/navigation/side-menu/side-menu.component';
import { OnBoardingPage } from '../pages/dashboard/views/on-boarding/on-boarding.page';
import { SupportChatPage } from '../pages/dashboard/views/support-chat/support-chat.page';

@Component({
  selector: 'app-app-shell',
  templateUrl: './app-shell.component.html',
  styleUrls: ['./app-shell.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    SideMenuComponent,
    OnBoardingPage,
    IonIcon,
    RouterOutlet,
    IonFab,
    IonFabButton
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppShellComponent implements OnInit {
  @ViewChild('mainContent', { read: ElementRef }) mainContentRef?: ElementRef;
  @ViewChild('menuToggleBtn', { read: ElementRef }) menuToggleBtnRef?: ElementRef;
  @ViewChild('sideMenu', { read: ElementRef }) sideMenuRef?: ElementRef;
  @ViewChild('bottomTabs', { read: ElementRef }) bottomTabRef?: ElementRef;
  @ViewChild('onBoardingBtn', { read: ElementRef }) onBoardingBtnRef?: ElementRef;
  @ViewChild('onBoarding', { read: ElementRef }) onBoardingRef?: ElementRef;
  @ViewChild('tabWhiteBg', { read: ElementRef }) tabWhiteBgRef?: ElementRef;

  public authService = inject(AuthService);
  private router = inject(Router);
  public animationCtrl = inject(AnimationController);
  private modalCtrl = inject(ModalController);

  isMenuOpen = true;
  showOnBoarding = false;

  constructor() {
    addIcons({ personOutline, exitOutline, arrowForwardOutline, closeOutline, logOutOutline, menuOutline, chatbubblesOutline });
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if ((event.url.includes('/user-profile') || event.url.includes('/admin-profile')) && this.showOnBoarding) {
        this.showOnBoardingToggle();
      }
    });
  }

  // ✅ NUEVO LISTENER PARA CAPTURAR EL CLICK DESDE CONTENT-VIEW
  @HostListener('window:open-onboarding-modal')
  onExternalTrigger() {
    if (!this.showOnBoarding) {
      this.showOnBoardingToggle();
    }
  }

  // DEFINICIÓN DE ANIMACIÓN "PRO" PARA ABRIR EL CHAT
  private enterAnimation = (baseEl: HTMLElement): Animation => {
    const root = baseEl.shadowRoot!;

    // Animación del fondo oscuro (backdrop)
    const backdropAnimation = this.animationCtrl.create()
      .addElement(root.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    // Animación de la ventana del chat (wrapper)
    const wrapperAnimation = this.animationCtrl.create()
      .addElement(root.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'translateY(20px) scale(0.95)' },
        { offset: 1, opacity: '1', transform: 'translateY(0px) scale(1)' }
      ]);

    // Combinamos ambas con una curva de velocidad suave
    return this.animationCtrl.create()
      .addElement(baseEl)
      .easing('cubic-bezier(0.4, 0.0, 0.2, 1)') // Curva profesional "ease-in-out"
      .duration(300) // Duración de 300ms
      .addAnimation([backdropAnimation, wrapperAnimation]);
  }

  // DEFINICIÓN DE ANIMACIÓN PARA CERRAR (Inversa de la de abrir)
  private leaveAnimation = (baseEl: HTMLElement): Animation => {
    return this.enterAnimation(baseEl).direction('reverse');
  }

  // FUNCIÓN PARA ABRIR EL CHAT USANDO LAS ANIMACIONES
  async abrirChat() {
    const modal = await this.modalCtrl.create({
      component: SupportChatPage,
      cssClass: 'chat-modal-widget',
      componentProps: {
        esModal: true
      },
      enterAnimation: this.enterAnimation,
      leaveAnimation: this.leaveAnimation
    });
    await modal.present();
  }

  goToProfile() {
    if (this.authService.isAdmin) {
      this.router.navigate(['/admin-profile']);
    } else {
      this.router.navigate(['/user-profile']);
    }
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/dashboard']);
    });
  }

  showOnBoardingToggle() {
    const transformBottom = 'calc(((100vh - (100vh * 0.92)) / 2) + 20px)';

    const onBoardingAnim = this.animationCtrl
      .create()
      .addElement(this.onBoardingRef?.nativeElement)
      .fromTo(
        'transform',
        `translateY(calc(-1 * (100vh + ${transformBottom} + 40px)))`,
        `translateY(calc(-1 * ${transformBottom}))`
      );

    const contentViewAnim = this.animationCtrl
      .create()
      .addElement(this.mainContentRef?.nativeElement)
      .fromTo('transform', 'none', 'scale(0.92)');

    const bottomTabAnim = this.animationCtrl
      .create()
      .addElement(this.bottomTabRef?.nativeElement)
      .fromTo('transform', 'none', 'translateY(200px)');

    const tabWhiteBgAnim = this.animationCtrl
      .create()
      .addElement(this.tabWhiteBgRef?.nativeElement)
      .fromTo('opacity', '1', '0');

    const menuBtnAnim = this.animationCtrl
      .create()
      .addElement(this.menuToggleBtnRef?.nativeElement)
      .fromTo('opacity', '1', '0');

    const allAnim = this.animationCtrl
      .create()
      .duration(600)
      .easing('cubic-bezier(0.32, 0.72, 0, 1)')
      .addAnimation([onBoardingAnim, contentViewAnim, bottomTabAnim, tabWhiteBgAnim, menuBtnAnim]);

    if (!this.showOnBoarding) {
      this.showOnBoarding = true;
      if (this.menuToggleBtnRef) {
        this.menuToggleBtnRef.nativeElement.style.pointerEvents = 'none';
      }
      allAnim.play();
    } else {
      allAnim.direction('reverse').play();
      allAnim.onFinish(() => {
        this.showOnBoarding = false;
        if (this.menuToggleBtnRef) {
          this.menuToggleBtnRef.nativeElement.style.pointerEvents = 'auto';
        }
      });
    }
  }

  onMenuToggle() {
    const contentViewAnim = this.animationCtrl
      .create()
      .addElement(this.mainContentRef?.nativeElement)
      .fromTo('transform', 'none', 'scale(0.92) translateX(240px)');

    const menuBtnAnim = this.animationCtrl
      .create()
      .addElement(this.menuToggleBtnRef?.nativeElement)
      .fromTo('transform', 'none', 'translateX(200px)');

    const sideMenuAnim = this.animationCtrl
      .create()
      .addElement(this.sideMenuRef?.nativeElement)
      .fromTo('transform', 'translateX(-100%)', 'none');

    const allAnim = this.animationCtrl
      .create()
      .duration(300)
      .easing('ease-out')
      .addAnimation([contentViewAnim, menuBtnAnim, sideMenuAnim]);

    if (this.isMenuOpen) {
      allAnim.play();
    } else {
      allAnim.direction('reverse').play();
    }
    this.isMenuOpen = !this.isMenuOpen;
  }
}