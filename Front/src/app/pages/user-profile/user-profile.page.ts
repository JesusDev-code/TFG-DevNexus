import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { addIcons } from 'ionicons';
import {
  personOutline,
  bookOutline,
  ticketOutline,
  chatbubbleEllipsesOutline,
  notificationsOutline,
  calendarOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-user-profile', 
  templateUrl: './user-profile.page.html',
  styleUrls: ['./user-profile.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent,
    IonIcon
  ]
})
export class UserProfilePage {
  private authService = inject(AuthService);

  constructor() {
    addIcons({
      'person-outline': personOutline,
      'book-outline': bookOutline,
      'ticket-outline': ticketOutline,
      'chatbubble-ellipses-outline': chatbubbleEllipsesOutline,
      'notifications-outline': notificationsOutline,
      'calendar-outline': calendarOutline
    });
  }
}
