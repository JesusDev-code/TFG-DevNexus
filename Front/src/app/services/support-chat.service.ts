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
  getDocs // ✅ IMPORTANTE: Necesario para leer los mensajes antes de borrarlos
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { MensajeChat, ChatRoom } from '../core/models/models';

@Injectable({
  providedIn: 'root'
})
export class SupportChatService {
  private firestore = inject(Firestore);

  // 1. OBTENER MENSAJES
  getChatMessages(chatId: string): Observable<MensajeChat[]> {
    const mensajesRef = collection(this.firestore, `soporte/${chatId}/mensajes`);
    const q = query(mensajesRef, orderBy('fecha', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<MensajeChat[]>;
  }

  // 2. OBTENER ESTADO DEL CHAT
  getChat(chatId: string): Observable<ChatRoom | undefined> {
    const chatDocRef = doc(this.firestore, `soporte/${chatId}`);
    return docData(chatDocRef, { idField: 'id' }) as Observable<ChatRoom>;
  }

  // 3. ENVIAR MENSAJE
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

  // 4. CERRAR TICKET
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

  // 5. REABRIR TICKET
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

  // ✅ 6. BORRADO PROFUNDO (Deep Delete)
  async deleteChat(chatId: string) {
    // PASO 1: Obtener referencia a la subcolección de mensajes
    const mensajesRef = collection(this.firestore, `soporte/${chatId}/mensajes`);
    const snapshot = await getDocs(mensajesRef);
    
    // PASO 2: Borrar cada mensaje individualmente
    // (Firebase cliente no permite borrar una colección entera de golpe, hay que ir uno a uno)
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // PASO 3: Ahora que está vacío, borramos el documento padre
    const chatDocRef = doc(this.firestore, `soporte/${chatId}`);
    await deleteDoc(chatDocRef);
  }
}