import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  docData,
  query,
  orderBy,
  Timestamp,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDocs
} from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MensajeChat, ChatRoom } from '../core/models/models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupportChatService {
  private firestore = inject(Firestore);
  private http = inject(HttpClient);

  getChatMessages(chatId: string): Observable<MensajeChat[]> {
    const mensajesRef = collection(this.firestore, `soporte/${chatId}/mensajes`);
    const q = query(mensajesRef, orderBy('fecha', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<MensajeChat[]>;
  }

  getChat(chatId: string): Observable<ChatRoom | undefined> {
    const chatDocRef = doc(this.firestore, `soporte/${chatId}`);
    return docData(chatDocRef, { idField: 'id' }) as Observable<ChatRoom>;
  }

  async sendMessage(chatId: string, texto: string, uid: string, nombre: string, esStaff: boolean) {
    const mensajesRef = collection(this.firestore, `soporte/${chatId}/mensajes`);
    
    await addDoc(mensajesRef, {
      texto,
      fecha: Timestamp.now(),
      uid,
      nombre,
      esStaff
    });

    const chatDocRef = doc(this.firestore, `soporte/${chatId}`);
    
    await setDoc(chatDocRef, {
      id: chatId,
      ultimoMensaje: texto,
      fecha: Timestamp.now(),
      estado: esStaff ? 'RESPONDIDO' : 'PENDIENTE',
      usuarioNombre: nombre
    }, { merge: true });

    if (esStaff) {
      const userId = chatId.replace('user_', '');
      this.http.post(`${environment.apiUrl}/notificaciones/soporte/${userId}`, {})
        .subscribe({ error: () => {} });
    }
  }

  getAllChats(): Observable<ChatRoom[]> {
    const soporteRef = collection(this.firestore, 'soporte');
    return (collectionData(soporteRef, { idField: 'id' }) as Observable<ChatRoom[]>).pipe(
      map(chats => [...chats].sort((a, b) => {
        const fa = (a as any).fecha?.toMillis?.() ?? 0;
        const fb = (b as any).fecha?.toMillis?.() ?? 0;
        return fb - fa;
      }))
    );
  }

  async closeChat(chatId: string) {
    const chatDocRef = doc(this.firestore, `soporte/${chatId}`);
    
    await updateDoc(chatDocRef, { estado: 'RESUELTO' });

    const mensajesRef = collection(this.firestore, `soporte/${chatId}/mensajes`);
    await addDoc(mensajesRef, {
      texto: '🔒 La incidencia ha sido cerrada por el soporte. Si necesitas más ayuda, inicia un nuevo ticket.',
      fecha: Timestamp.now(),
      uid: 'SYSTEM',
      nombre: 'Sistema',
      esStaff: true 
    });
  }

  async reopenChat(chatId: string) {
    const chatDocRef = doc(this.firestore, `soporte/${chatId}`);
    
    await updateDoc(chatDocRef, { estado: 'PENDIENTE' });

    const mensajesRef = collection(this.firestore, `soporte/${chatId}/mensajes`);
    await addDoc(mensajesRef, {
      texto: '✨ --- NUEVA CONSULTA INICIADA --- ✨',
      fecha: Timestamp.now(),
      uid: 'SYSTEM',
      nombre: 'Sistema',
      esStaff: true 
    });
  }

  async deleteChat(chatId: string) {
    const mensajesRef = collection(this.firestore, `soporte/${chatId}/mensajes`);
    const snapshot = await getDocs(mensajesRef);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    const chatDocRef = doc(this.firestore, `soporte/${chatId}`);
    await deleteDoc(chatDocRef);
  }
}