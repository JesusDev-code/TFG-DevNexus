import { Component, OnInit, inject, Output, EventEmitter, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonIcon,
  IonItem,
  IonLabel,
  IonRow,
  IonCol,
  IonText,
  NavController,
  Platform,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline, homeOutline, businessOutline,
  mailOutline, newspaperOutline, helpCircleOutline,
  logOutOutline, shieldCheckmarkOutline
} from 'ionicons/icons';
import { MenuItem, menuItemsList } from '../../models/side-menu';
import { AuthService } from 'src/app/services/auth.service';
import { UsuarioDto } from 'src/app/core/models/models';

@Component({
  selector: 'cr-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ Rendimiento extremo
  imports: [
    CommonModule,
    IonRow, IonCol, IonText, IonIcon, IonItem, IonLabel
  ],
})
export class SideMenuComponent implements OnInit {

  public authService = inject(AuthService);
  private navigation = inject(NavController);
  public platform = inject(Platform);

  // ✅ EVENTO DE SALIDA PARA AVISAR AL PADRE QUE CIERRE EL MENÚ
  @Output() closeMenuEvent = new EventEmitter<void>();

  menuItems = menuItemsList;
  selectedMenu: MenuItem | null = null;
  // Convertimos a public para que la vista pueda acceder a authService.currentUser() directamente en vez de usar variable

  constructor() {
    addIcons({
      personOutline, homeOutline, businessOutline,
      mailOutline, newspaperOutline, helpCircleOutline,
      logOutOutline, shieldCheckmarkOutline
    });
  }

  ngOnInit() {
    const active = this.menuItems.find(m => m.status) || this.menuItems[0];
    this.selectedMenu = active;
  }

  onMenuItemPress(index: number, menu: MenuItem) {
    this.menuItems.forEach(m => m.status = false);
    menu.status = true;
    this.selectedMenu = menu;

    if (menu.route) {
      this.navigation.navigateForward(menu.route);
      // ✅ EMITIMOS SEÑAL DE CIERRE AL ELEGIR OPCIÓN
      this.closeMenuEvent.emit();
    }
  }

  goToProfile() {
    if (!this.authService.currentUser()) return;

    if (this.authService.isAdmin) {
      this.navigation.navigateForward('/admin-profile');
    } else {
      this.navigation.navigateForward('/user-profile');
    }
    // ✅ EMITIMOS SEÑAL DE CIERRE AL IR AL PERFIL
    this.closeMenuEvent.emit();
  }

  goBack() {
    this.authService.logout().subscribe(() => {
      this.navigation.navigateRoot('/dashboard');
      // ✅ EMITIMOS SEÑAL DE CIERRE AL SALIR
      this.closeMenuEvent.emit();
    });
  }

  trackMenuItems(index: number, item: MenuItem) {
    return item.id;
  }
}