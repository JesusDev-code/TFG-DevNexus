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
import { Observable } from 'rxjs';
import { MensajeChat, ChatRoom } from '../core/models/models';

@Injectable({
  providedIn: 'root'
})
export class SupportChatService {
  private firestore = inject(Firestore);

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
  }

  getAllChats(): Observable<ChatRoom[]> {
    const soporteRef = collection(this.firestore, 'soporte');
    const q = query(soporteRef, orderBy('fecha', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<ChatRoom[]>;
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