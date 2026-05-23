import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  codeSlashOutline, colorPaletteOutline, logoJavascript,
  documentTextOutline, documentOutline, layersOutline,
  addOutline, trashOutline, folderOutline, createOutline,
  chevronDownOutline, chevronForwardOutline
} from 'ionicons/icons';
import { DiarioDto } from 'src/app/core/models/models';

type TreeRow = {
  kind: 'folder' | 'file';
  path: string;
  name: string;
  depth: number;
  source?: 'manual' | 'derived' | 'both';
  hasFiles?: boolean;
  file?: DiarioDto;
};

@Component({
  selector: 'app-file-tree',
  standalone: true,
  imports: [CommonModule, IonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tree-root">
      <div class="tree-project-header">
        <ion-icon name="folder-outline"></ion-icon>
        <span class="project-name" [title]="nombreProyecto">{{ nombreProyecto }}</span>
      </div>

      <div class="tree-files">
        <div *ngFor="let row of treeRows; trackBy: trackByPath"
             class="tree-item"
             [class.folder-row]="row.kind === 'folder'"
             [class.file-row]="row.kind === 'file'"
             [class.collapsed]="row.kind === 'folder' && isFolderCollapsed(row.path)"
             [class.active]="row.kind === 'file' && archivoActivo?.id === row.file?.id"
             [style.--depth]="row.depth"
             [style.padding-left.px]="14 + (row.depth * 14)"
             (click)="onTreeRowClick(row)">
          <ion-icon *ngIf="row.kind === 'folder'"
                    class="folder-chevron"
                    [name]="isFolderCollapsed(row.path) ? 'chevron-forward-outline' : 'chevron-down-outline'">
          </ion-icon>
          <span *ngIf="row.kind === 'file'" class="folder-chevron-placeholder"></span>
          <ion-icon [name]="row.kind === 'folder' ? 'folder-outline' : getIconForFile(row.file?.filename ?? '')"></ion-icon>
          <span class="filename" [title]="row.path">{{ row.name }}</span>

          <ng-container *ngIf="row.kind === 'folder' && !readOnly">
            <button class="folder-action-btn subfolder"
                    (click)="$event.stopPropagation(); nuevaSubcarpeta.emit(row.path)"
                    title="Nueva subcarpeta">
              <ion-icon name="folder-outline"></ion-icon>
            </button>
            <button class="folder-action-btn create"
                    (click)="$event.stopPropagation(); nuevoArchivoEnCarpeta.emit(row.path)"
                    title="Nuevo archivo en esta carpeta">
              <ion-icon name="add-outline"></ion-icon>
            </button>
            <button class="folder-action-btn"
                    (click)="$event.stopPropagation(); editarCarpeta.emit(row.path)"
                    title="Renombrar carpeta">
              <ion-icon name="create-outline"></ion-icon>
            </button>
            <button class="folder-action-btn delete"
                    [disabled]="!!row.hasFiles"
                    (click)="$event.stopPropagation(); borrarCarpeta.emit(row.path)"
                    [title]="row.hasFiles ? 'No se puede eliminar: la carpeta contiene archivos' : 'Eliminar carpeta'">
              <ion-icon name="trash-outline"></ion-icon>
            </button>
          </ng-container>

          <button *ngIf="row.kind === 'file' && row.file && !readOnly"
                  class="rename-btn"
                  (click)="$event.stopPropagation(); editarArchivo.emit(row.file)"
                  title="Renombrar archivo">
            <ion-icon name="create-outline"></ion-icon>
          </button>
          <button *ngIf="row.kind === 'file' && row.file && !readOnly"
                  class="delete-btn"
                  (click)="$event.stopPropagation(); borrarArchivo.emit(row.file)"
                  title="Eliminar archivo">
            <ion-icon name="trash-outline"></ion-icon>
          </button>
        </div>

        <div *ngIf="treeRows.length === 0" class="tree-empty">
          <span>Sin archivos aún</span>
        </div>
      </div>

      <div class="tree-actions" *ngIf="!readOnly">
        <button class="btn-nuevo-archivo" (click)="nuevoArchivo.emit()">
          <ion-icon name="add-outline"></ion-icon>
          Nuevo archivo
        </button>
        <button class="btn-nueva-carpeta" (click)="nuevaCarpeta.emit()">
          <ion-icon name="folder-outline"></ion-icon>
          Nueva carpeta
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./file-tree.component.scss']
})
export class FileTreeComponent {
  @Input() archivos: DiarioDto[] = [];
  @Input() archivoActivo: DiarioDto | null = null;
  @Input() nombreProyecto = '';
  @Input() carpetasManual: string[] = [];
  @Input() readOnly = false;

  @Output() archivoSeleccionado = new EventEmitter<DiarioDto>();
  @Output() nuevoArchivo = new EventEmitter<void>();
  @Output() nuevaCarpeta = new EventEmitter<void>();
  @Output() nuevaSubcarpeta = new EventEmitter<string>();
  @Output() nuevoArchivoEnCarpeta = new EventEmitter<string>();
  @Output() borrarArchivo = new EventEmitter<DiarioDto>();
  @Output() editarArchivo = new EventEmitter<DiarioDto>();
  @Output() editarCarpeta = new EventEmitter<string>();
  @Output() borrarCarpeta = new EventEmitter<string>();
  private collapsedFolders = new Set<string>();

  constructor() {
    addIcons({
      'code-slash-outline': codeSlashOutline,
      'color-palette-outline': colorPaletteOutline,
      'logo-javascript': logoJavascript,
      'document-text-outline': documentTextOutline,
      'document-outline': documentOutline,
      'layers-outline': layersOutline,
      'add-outline': addOutline,
      'trash-outline': trashOutline,
      'folder-outline': folderOutline,
      'create-outline': createOutline,
      'chevron-down-outline': chevronDownOutline,
      'chevron-forward-outline': chevronForwardOutline,
    });
  }

  get treeRows(): TreeRow[] {
    const files = [...this.archivos]
      .map(archivo => {
        const fullPath = this.normalizePath(this.getDisplayFileName(archivo));
        return {
          archivo,
          fullPath,
          dir: this.getParentPath(fullPath),
          name: this.getBaseName(fullPath),
        };
      })
      .filter(f => !!f.fullPath)
      .sort((a, b) => a.fullPath.localeCompare(b.fullPath));

    const folderSources = new Map<string, 'manual' | 'derived' | 'both'>();

    for (const manual of this.carpetasManual.map(c => this.normalizePath(c)).filter(Boolean)) {
      folderSources.set(manual, 'manual');
    }

    for (const file of files) {
      const parts = file.fullPath.split('/').filter(Boolean);
      for (let i = 0; i < parts.length - 1; i++) {
        const folderPath = parts.slice(0, i + 1).join('/');
        const prev = folderSources.get(folderPath);
        if (!prev) folderSources.set(folderPath, 'derived');
        else if (prev !== 'both') folderSources.set(folderPath, 'both');
      }
    }

    const rows: TreeRow[] = [];
    this.appendRowsRecursively('', 0, folderSources, files, rows);
    return rows;
  }

  trackByPath(_index: number, row: TreeRow): string {
    return `${row.kind}:${row.path}`;
  }

  onTreeRowClick(row: TreeRow) {
    if (row.kind === 'folder') {
      const folder = this.normalizePath(row.path);
      if (this.collapsedFolders.has(folder)) this.collapsedFolders.delete(folder);
      else this.collapsedFolders.add(folder);
      return;
    }
    if (row.file) {
      this.archivoSeleccionado.emit(row.file);
    }
  }

  isFolderCollapsed(path: string): boolean {
    return this.collapsedFolders.has(this.normalizePath(path));
  }

  getIconForFile(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    const icons: Record<string, string> = {
      html:  'code-slash-outline',
      css:   'color-palette-outline',
      js:    'logo-javascript',
      ts:    'logo-javascript',
      py:    'code-slash-outline',
      java:  'code-slash-outline',
      md:    'document-text-outline',
      json:  'layers-outline',
    };
    return icons[ext] ?? 'document-outline';
  }

  getDisplayFileName(archivo: DiarioDto): string {
    if (archivo.filename && archivo.filename.trim()) {
      return this.normalizePath(archivo.filename);
    }
    return `archivo-${archivo.id}.txt`;
  }

  private normalizePath(path: string): string {
    return path
      .replace(/\\/g, '/')
      .replace(/\/{2,}/g, '/')
      .replace(/^\/+|\/+$/g, '');
  }

  private appendRowsRecursively(
    parentPath: string,
    depth: number,
    folderSources: Map<string, 'manual' | 'derived' | 'both'>,
    files: Array<{ archivo: DiarioDto; fullPath: string; dir: string; name: string }>,
    rows: TreeRow[]
  ) {
    const childFolders = [...folderSources.keys()]
      .filter(path => this.getParentPath(path) === parentPath)
      .sort((a, b) => a.localeCompare(b));

    for (const folderPath of childFolders) {
      rows.push({
        kind: 'folder',
        path: folderPath,
        name: this.getBaseName(folderPath),
        depth,
        source: folderSources.get(folderPath),
        hasFiles: files.some(f => f.fullPath.startsWith(`${folderPath}/`)),
      });

      if (!this.isFolderCollapsed(folderPath)) {
        this.appendRowsRecursively(folderPath, depth + 1, folderSources, files, rows);
      }
    }

    const childFiles = files
      .filter(file => file.dir === parentPath)
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const file of childFiles) {
      rows.push({
        kind: 'file',
        path: file.fullPath,
        name: file.name,
        depth,
        file: file.archivo,
      });
    }
  }

  private getParentPath(path: string): string {
    const normalized = this.normalizePath(path);
    const idx = normalized.lastIndexOf('/');
    return idx === -1 ? '' : normalized.slice(0, idx);
  }

  private getBaseName(path: string): string {
    const normalized = this.normalizePath(path);
    const idx = normalized.lastIndexOf('/');
    return idx === -1 ? normalized : normalized.slice(idx + 1);
  }
}
