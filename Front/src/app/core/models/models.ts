export interface UsuarioDto {
  id: number;
  nombre: string;
  email: string;
  rolNombre: string;
  departamentoNombre?: string;
  departamentoId?: number;
  fcm_token?: string;
  biografia?: string;
  foto_perfil?: string;
  permiteContacto: boolean;
  motivoNoContacto?: string;
}

export interface UsuarioCreateDto {
  nombre: string;
  biografia?: string;
  email: string;
  rolId: number;
  departamentoId?: number;
  fcm_token?: string;
}

export interface UsuarioUpdateDto {
  nombre?: string;
  biografia?: string;
  foto_perfil?: string;
  permiteContacto?: boolean;
  motivoNoContacto?: string;
  departamentoId?: number | null;
  rolId?: number;
  fcm_token?: string | null;
}

export interface DiarioTemaCreateDto {
  titulo: string;
  descripcion?: string;
}

export type Visibilidad = 'PRIVADO' | 'PENDIENTE' | 'PUBLICO';


export interface DiarioTemaDto {
  id: number;
  titulo: string;
  descripcion?: string;
  usuarioId: number;
  visibilidad: Visibilidad;
  usuarioNombre?: string;
  tituloPublicacion?: string;
  descripcionPublicacion?: string;
}

export interface ColaboradorDto {
  id: number;
  nombre: string;
  foto_perfil?: string;
}

export interface DiarioCreateDto {
  contenido: string;
  visibilidad: Visibilidad;
  temaId: number;
  tipo?: string;
  filename?: string;
}

export type TicketStatus = 'ABIERTO' | 'EN_PROGRESO' | 'RESUELTO';
export type TicketPriority = 'ALTA' | 'MEDIA' | 'BAJA';


export interface TicketDto {
  id: number;
  codigo: string;
  titulo: string;
  descripcion: string;
  estado: string; 
  prioridad: string;
  fechaCreacion: string;
  usuarioNombre: string;
}

export interface TicketComentarioDto {
  id: number;
  texto: string;
  autorNombre: string;
  esStaff: boolean;
  fechaEnvio: string;
}

export interface TicketHistoricoDto {
  id: number;
  estadoAnterior: string | null;
  estadoNuevo: string;
  usuarioNombre: string;
  comentario: string | null;
  fecha: string;
}

export interface ConversacionDto {
  id: number;
  titulo: string;
  tipo: 'individual' | 'grupal';
  ultimoMensaje?: string;
  fechaUltimoMensaje?: string;
  unreadCount?: number;
  avatarUrl?: string;
  esAdmin: boolean;
}
export interface ConversacionCreateDto {
  titulo: string;
  tipo: 'individual' | 'grupal';
  invitadoId?: number;
}

export interface MensajeDto {
  id: number;
  texto: string;
  autorId: number;
  autorNombre: string;
  autorFoto?: string;
  fechaEnvio: string;
  esStaff: boolean;
  leido: boolean;
}

export interface MensajeCreateDto {
  conversacionId: number;
  texto: string;
}

export interface NotificacionDto {
  id: number;
  mensaje: string;
  fecha: string;
  leida: boolean;
  // Estos campos los calcularemos en el frontend para el estilo
  tipo?: 'mensaje' | 'evento' | 'ticket'; 
  icono?: string;
}

export interface Evento {
  id?: number;
  titulo: string;
  descripcion?: string;
  fechaEvento: string; // Formato 'yyyy-MM-dd'
  horaEvento: string;  // Formato 'HH:mm'
  visibilidad: 'PRIVADO' | 'PUBLICO';
  usuario?: {
    id: number;
    nombre: string;
  };
}

export interface AuditoriaDto {
  id: number;
  accion: string;       // Ej: "LOGIN", "ELIMINAR"
  recurso: string;      // Ej: "Usuario", "Ticket"
  descripcion: string;  // Detalles del log
  severidad: 'INFO' | 'WARNING' | 'DANGER';
  fecha: string;        // Fecha en formato ISO
  usuarioEmail?: string; // Email del responsable (opcional)
}

export interface DiarioComentario {
  id: number;
  texto: string;
  autorNombre: string;
  esAdmin: boolean;
  fecha: string;
}

export interface DiarioDto {
  id: number;
  contenido: string;
  visibilidad: 'PUBLICO' | 'PRIVADO' | 'PENDIENTE';
  fechaCreacion: string;
  usuarioId?: number;
  usuarioNombre: string;
  temaId?: number;
  temaTitulo?: string;
  tipo?: 'FILE' | 'LOG' | null;
  filename?: string;

  // UI state — no viene del backend
  mostrarComentarios?: boolean;
  listaComentarios?: DiarioComentario[];
  nuevoComentario?: string;
  cargandoComentarios?: boolean;
}

export interface ProyectoAnalisisDto {
  feedback: string;
  score: number;
  sugerencias: string[];
  errores: string[];
}

export interface MensajeChat {
  id?: string;
  texto: string;
  fecha: any;      // Timestamp de Firebase
  uid: string;     // Quién lo envió
  nombre: string;  // Nombre visual
  esStaff: boolean; // ¿Es un administrador? (Para ponerlo a la izquierda o derecha)
}

export interface ChatRoom {
  id: string; // ID del chat (coincide con el ID del usuario cliente)
  usuarioNombre: string;
  ultimoMensaje: string;
  fecha: any;
  estado: 'PENDIENTE' | 'RESPONDIDO' | 'RESUELTO';
}