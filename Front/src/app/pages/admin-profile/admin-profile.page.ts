import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router'; 
import { addIcons } from 'ionicons';
import { 
  peopleOutline, 
  ticketOutline, 
  chatbubblesOutline, 
  calendarOutline, 
  shieldCheckmarkOutline, 
  personOutline, 
  bookOutline,
  fileTrayFullOutline // ✅ NUEVO ICONO
} from 'ionicons/icons';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.page.html',
  styleUrls: ['./admin-profile.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonIcon, 
    RouterModule
  ]
})
export class AdminProfilePage implements OnInit {

  constructor() {
    addIcons({ 
      peopleOutline, 
      ticketOutline, 
      chatbubblesOutline, 
      calendarOutline, 
      shieldCheckmarkOutline, 
      personOutline, 
      bookOutline,
      fileTrayFullOutline // ✅ REGISTRADO
    });
  }

  ngOnInit() {}
}