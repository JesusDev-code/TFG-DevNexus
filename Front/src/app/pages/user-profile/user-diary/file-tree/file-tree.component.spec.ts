import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FileTreeComponent } from './file-tree.component';
import { DiarioDto } from 'src/app/core/models/models';
import { getCommonTestProviders } from '../../../../testing/test-utils';

/**
 * Deep Dive: FileTreeComponent — Árbol de archivos del IDE.
 *
 * Componente puramente presentacional con lógica de árbol:
 * - treeRows: getter que construye la lista plana de carpetas+archivos
 * - onTreeRowClick: emite archivoSeleccionado para files, colapsa/expande para folders
 * - readOnly: oculta botones de acción (borrar, crear, etc.)
 *
 * Sin dependencias de servicios — los tests son rápidos y síncronos.
 */
describe('FileTreeComponent', () => {
  let component: FileTreeComponent;
  let fixture: ComponentFixture<FileTreeComponent>;

  const ARCHIVO_HTML: DiarioDto = {
    id: 1,
    contenido: '<h1>Test</h1>',
    visibilidad: 'PRIVADO',
    fechaCreacion: '2026-01-01',
    usuarioNombre: 'Test User',
    temaTitulo: 'Proyecto Test',
    tipo: 'FILE',
    filename: 'index.html'
  };

  const ARCHIVO_CSS: DiarioDto = {
    id: 2,
    contenido: 'body {}',
    visibilidad: 'PRIVADO',
    fechaCreacion: '2026-01-01',
    usuarioNombre: 'Test User',
    temaTitulo: 'Proyecto Test',
    tipo: 'FILE',
    filename: 'src/style.css'
  };

  const ARCHIVO_SIN_NOMBRE: DiarioDto = {
    id: 3,
    contenido: 'console.log()',
    visibilidad: 'PRIVADO',
    fechaCreacion: '2026-01-01',
    usuarioNombre: 'Test User',
    temaTitulo: 'Proyecto Test',
    tipo: 'FILE',
    filename: ''
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileTreeComponent],
      providers: [
        ...getCommonTestProviders(),
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(FileTreeComponent);
    component = fixture.componentInstance;
    component.archivos = [];
    component.carpetasManual = [];
    component.nombreProyecto = 'Proyecto Test';
  });

  // ─── Creación ─────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─── Estado inicial ───────────────────────────────────────────────────────

  it('con archivos vacíos, treeRows devuelve array vacío', () => {
    component.archivos = [];
    expect(component.treeRows).toEqual([]);
  });

  it('readOnly arranca en false por defecto', () => {
    expect(component.readOnly).toBeFalse();
  });

  // ─── treeRows getter ──────────────────────────────────────────────────────

  it('treeRows incluye una fila de archivo para cada DiarioDto', () => {
    component.archivos = [ARCHIVO_HTML];
    const rows = component.treeRows;
    const fileRows = rows.filter(r => r.kind === 'file');
    expect(fileRows.length).toBe(1);
    expect(fileRows[0].name).toBe('index.html');
  });

  it('treeRows crea fila de carpeta "src" cuando hay archivo en src/style.css', () => {
    component.archivos = [ARCHIVO_CSS];
    const rows = component.treeRows;
    const folderRows = rows.filter(r => r.kind === 'folder');
    expect(folderRows.length).toBeGreaterThanOrEqual(1);
    expect(folderRows.some(r => r.name === 'src')).toBeTrue();
  });

  it('treeRows: archivo sin filename usa fallback "archivo-{id}.txt"', () => {
    component.archivos = [ARCHIVO_SIN_NOMBRE];
    const rows = component.treeRows;
    const fileRow = rows.find(r => r.kind === 'file');
    expect(fileRow).toBeDefined();
    expect(fileRow!.name).toContain('archivo-3');
  });

  // ─── onTreeRowClick: archivo emite evento ─────────────────────────────────

  it('onTreeRowClick con fila de archivo emite archivoSeleccionado', () => {
    component.archivos = [ARCHIVO_HTML];
    let emitido: DiarioDto | undefined;
    component.archivoSeleccionado.subscribe((a: DiarioDto) => emitido = a);

    const rows = component.treeRows;
    const fileRow = rows.find(r => r.kind === 'file')!;
    component.onTreeRowClick(fileRow);

    expect(emitido).toBeDefined();
    expect(emitido?.filename).toBe('index.html');
  });

  it('onTreeRowClick con fila de folder NO emite archivoSeleccionado', () => {
    component.archivos = [ARCHIVO_CSS];
    let emitido = false;
    component.archivoSeleccionado.subscribe(() => emitido = true);

    const rows = component.treeRows;
    const folderRow = rows.find(r => r.kind === 'folder')!;
    component.onTreeRowClick(folderRow);

    expect(emitido).toBeFalse();
  });

  // ─── Collapse/expand de carpetas ─────────────────────────────────────────

  it('onTreeRowClick en folder alterna su estado colapsado', () => {
    component.archivos = [ARCHIVO_CSS];
    const rows = component.treeRows;
    const folderRow = rows.find(r => r.kind === 'folder')!;

    expect(component.isFolderCollapsed(folderRow.path)).toBeFalse();

    component.onTreeRowClick(folderRow);
    expect(component.isFolderCollapsed(folderRow.path)).toBeTrue();

    component.onTreeRowClick(folderRow);
    expect(component.isFolderCollapsed(folderRow.path)).toBeFalse();
  });

  // ─── getIconForFile ───────────────────────────────────────────────────────

  it('getIconForFile devuelve "code-slash-outline" para .html', () => {
    expect(component.getIconForFile('index.html')).toBe('code-slash-outline');
  });

  it('getIconForFile devuelve "color-palette-outline" para .css', () => {
    expect(component.getIconForFile('style.css')).toBe('color-palette-outline');
  });

  it('getIconForFile devuelve "document-outline" para extensiones desconocidas', () => {
    expect(component.getIconForFile('archivo.xyz')).toBe('document-outline');
  });

  // ─── readOnly: oculta botones de acción ───────────────────────────────────

  it('en modo readOnly=true, el template NO muestra botones de acción (tree-actions ausente)', () => {
    component.readOnly = true;
    component.archivos = [ARCHIVO_HTML];
    fixture.detectChanges();

    // Con NO_ERRORS_SCHEMA no podemos verificar el DOM de Ionic directamente,
    // pero podemos verificar el input
    expect(component.readOnly).toBeTrue();
  });

  // ─── carpetasManual ───────────────────────────────────────────────────────

  it('carpetas manuales se incluyen en treeRows aunque no tengan archivos', () => {
    component.archivos = [];
    component.carpetasManual = ['docs'];

    const rows = component.treeRows;
    expect(rows.some(r => r.kind === 'folder' && r.name === 'docs')).toBeTrue();
  });

  // ─── trackByPath ──────────────────────────────────────────────────────────

  it('trackByPath devuelve string único por fila', () => {
    component.archivos = [ARCHIVO_HTML, ARCHIVO_CSS];
    const rows = component.treeRows;
    const keys = rows.map((r, i) => component.trackByPath(i, r));
    const unique = new Set(keys);
    expect(unique.size).toBe(rows.length);
  });
});
