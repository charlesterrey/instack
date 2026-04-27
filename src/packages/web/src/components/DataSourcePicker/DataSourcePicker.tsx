import { useState, useEffect, useCallback, type ReactNode } from 'react';

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─── Types ───────────────────────────────────────────────────────────────────

type PickerState = 'browsing' | 'previewing' | 'connecting' | 'connected' | 'error';

interface Drive {
  id: string;
  name: string;
  driveType: string;
}

interface FileEntry {
  id: string;
  name: string;
  type: 'folder' | 'file';
  mimeType?: string;
  size?: number;
  lastModifiedAt?: string;
}

interface PreviewData {
  columns: string[];
  rows: Record<string, unknown>[];
  totalRows: number;
}

interface DataSourcePickerProps {
  open: boolean;
  onClose: () => void;
  onConnect: (source: {
    type: 'excel_file' | 'sharepoint_list';
    m365ResourceId: string;
    name: string;
  }) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ALLOWED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

function isAllowedFile(name: string): boolean {
  const lower = name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cx('animate-spin', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width="20"
      height="20"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function ModalOverlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Sélectionner une source de données"
    >
      {children}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function DataSourcePicker({ open, onClose, onConnect }: DataSourcePickerProps) {
  const [state, setState] = useState<PickerState>('browsing');
  const [drives, setDrives] = useState<Drive[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [pathHistory, setPathHistory] = useState<string[]>(['/']);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [isLoadingDrives, setIsLoadingDrives] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── Fetch drives ─────────────────────────────────────────────────────────

  const fetchDrives = useCallback(async () => {
    setIsLoadingDrives(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/data-sources/browse/drives');
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const json = (await res.json()) as { drives: Drive[] };
      setDrives(json.drives);
      if (json.drives.length > 0 && !selectedDriveId) {
        setSelectedDriveId(json.drives[0]?.id ?? '');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setErrorMessage(`Impossible de charger les lecteurs : ${msg}`);
      setState('error');
    } finally {
      setIsLoadingDrives(false);
    }
  }, [selectedDriveId]);

  // ── Fetch files ──────────────────────────────────────────────────────────

  const fetchFiles = useCallback(async (driveId: string, path: string) => {
    setIsLoadingFiles(true);
    setErrorMessage(null);
    try {
      const params = new URLSearchParams({ driveId, path });
      const res = await fetch(`/api/data-sources/browse/files?${params.toString()}`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const json = (await res.json()) as { files: FileEntry[] };
      const filtered = json.files.filter(
        (f) => f.type === 'folder' || isAllowedFile(f.name),
      );
      setFiles(filtered);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setErrorMessage(`Impossible de charger les fichiers : ${msg}`);
      setState('error');
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  // ── Fetch preview ────────────────────────────────────────────────────────

  const fetchPreview = useCallback(async (fileId: string) => {
    setIsLoadingPreview(true);
    setErrorMessage(null);
    setState('previewing');
    try {
      const res = await fetch(`/api/data-sources/files/${encodeURIComponent(fileId)}/preview`);
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const json = (await res.json()) as PreviewData;
      setPreview(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setErrorMessage(`Impossible de charger l'aperçu : ${msg}`);
      setState('error');
    } finally {
      setIsLoadingPreview(false);
    }
  }, []);

  // ── Connect ──────────────────────────────────────────────────────────────

  const handleConnect = useCallback(async () => {
    if (!selectedFile) return;
    setState('connecting');
    setErrorMessage(null);

    // Simulate a short delay for UX feedback, then callback
    await new Promise((resolve) => {
      setTimeout(resolve, 400);
    });

    setState('connected');
    onConnect({
      type: 'excel_file',
      m365ResourceId: selectedFile.id,
      name: selectedFile.name,
    });

    // Auto-close after brief success state
    setTimeout(() => {
      onClose();
    }, 800);
  }, [selectedFile, onConnect, onClose]);

  // ── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (open) {
      setState('browsing');
      setSelectedFile(null);
      setPreview(null);
      setErrorMessage(null);
      void fetchDrives();
    }
  }, [open, fetchDrives]);

  useEffect(() => {
    if (selectedDriveId && open) {
      void fetchFiles(selectedDriveId, currentPath);
    }
  }, [selectedDriveId, currentPath, open, fetchFiles]);

  // ── Navigation handlers ──────────────────────────────────────────────────

  const navigateToFolder = useCallback(
    (folderName: string) => {
      const newPath = currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`;
      setPathHistory((prev) => [...prev, newPath]);
      setCurrentPath(newPath);
      setSelectedFile(null);
      setPreview(null);
      setState('browsing');
    },
    [currentPath],
  );

  const navigateBack = useCallback(() => {
    if (pathHistory.length <= 1) return;
    const newHistory = pathHistory.slice(0, -1);
    setPathHistory(newHistory);
    setCurrentPath(newHistory[newHistory.length - 1] ?? '/');
    setSelectedFile(null);
    setPreview(null);
    setState('browsing');
  }, [pathHistory]);

  const handleFileClick = useCallback(
    (file: FileEntry) => {
      if (file.type === 'folder') {
        navigateToFolder(file.name);
      } else {
        setSelectedFile(file);
        void fetchPreview(file.id);
      }
    },
    [navigateToFolder, fetchPreview],
  );

  const handleDriveChange = useCallback((driveId: string) => {
    setSelectedDriveId(driveId);
    setCurrentPath('/');
    setPathHistory(['/']);
    setSelectedFile(null);
    setPreview(null);
    setState('browsing');
  }, []);

  const handleRetry = useCallback(() => {
    setState('browsing');
    setErrorMessage(null);
    if (selectedDriveId) {
      void fetchFiles(selectedDriveId, currentPath);
    }
  }, [selectedDriveId, currentPath, fetchFiles]);

  // ── Render ───────────────────────────────────────────────────────────────

  if (!open) return null;

  return (
    <ModalOverlay onClose={onClose}>
      <div className="bg-primary shadow-lg ring-secondary flex h-[600px] w-full max-w-3xl flex-col overflow-hidden rounded-xl ring-1">
        {/* Header */}
        <div className="border-secondary flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-primary text-lg font-semibold">
              Sélectionner une source de données
            </h2>
            <p className="text-tertiary mt-0.5 text-sm">
              Parcourez vos fichiers Excel et SharePoint
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-quaternary hover:text-tertiary rounded-lg p-2 transition"
            aria-label="Fermer"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5l10 10"
                stroke="currentColor"
                strokeWidth="1.67"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Drive selector */}
        <div className="border-secondary flex items-center gap-3 border-b px-6 py-3">
          <label htmlFor="drive-select" className="text-secondary text-sm font-medium">
            Lecteur
          </label>
          {isLoadingDrives ? (
            <Spinner className="text-tertiary" />
          ) : (
            <select
              id="drive-select"
              value={selectedDriveId ?? ''}
              onChange={(e) => handleDriveChange(e.target.value)}
              className="border-primary bg-primary text-primary rounded-lg border px-3 py-1.5 text-sm shadow-xs focus:outline-2 focus:outline-offset-2 focus:outline-brand"
            >
              {drives.map((drive) => (
                <option key={drive.id} value={drive.id}>
                  {drive.name} ({drive.driveType})
                </option>
              ))}
            </select>
          )}

          {/* Breadcrumb */}
          <div className="text-tertiary ml-auto flex items-center gap-1 text-sm">
            {pathHistory.map((p, idx) => (
              <span key={p} className="flex items-center gap-1">
                {idx > 0 && <span className="text-quaternary">/</span>}
                <button
                  type="button"
                  onClick={() => {
                    const newHistory = pathHistory.slice(0, idx + 1);
                    setPathHistory(newHistory);
                    setCurrentPath(p);
                    setSelectedFile(null);
                    setPreview(null);
                    setState('browsing');
                  }}
                  className="hover:text-primary transition"
                >
                  {p === '/' ? 'Racine' : p.split('/').pop()}
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="flex min-h-0 flex-1">
          {/* File list */}
          <div className="border-secondary flex w-1/2 flex-col overflow-y-auto border-r">
            {isLoadingFiles ? (
              <div className="flex flex-1 items-center justify-center">
                <Spinner className="text-tertiary" />
              </div>
            ) : state === 'error' && !selectedFile ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
                <div className="bg-utility-red-50 text-utility-red-700 rounded-full p-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 6.5v3.333M10 13.5h.008M18.333 10a8.333 8.333 0 11-16.667 0 8.333 8.333 0 0116.667 0z"
                      stroke="currentColor"
                      strokeWidth="1.67"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-tertiary text-center text-sm">{errorMessage}</p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="text-brand-700 hover:text-brand-800 text-sm font-semibold transition"
                >
                  Réessayer
                </button>
              </div>
            ) : files.length === 0 ? (
              <div className="flex flex-1 items-center justify-center px-6">
                <p className="text-tertiary text-center text-sm">
                  Aucun fichier Excel trouvé dans ce dossier.
                </p>
              </div>
            ) : (
              <ul className="divide-secondary divide-y">
                {pathHistory.length > 1 && (
                  <li>
                    <button
                      type="button"
                      onClick={navigateBack}
                      className="hover:bg-secondary flex w-full items-center gap-3 px-4 py-3 text-left transition"
                    >
                      <span className="text-tertiary text-sm">← Retour</span>
                    </button>
                  </li>
                )}
                {files.map((file) => (
                  <li key={file.id}>
                    <button
                      type="button"
                      onClick={() => handleFileClick(file)}
                      className={cx(
                        'flex w-full items-center gap-3 px-4 py-3 text-left transition',
                        selectedFile?.id === file.id
                          ? 'bg-utility-brand-50'
                          : 'hover:bg-secondary',
                      )}
                    >
                      {/* Icon */}
                      <span
                        className={cx(
                          'flex size-8 shrink-0 items-center justify-center rounded-lg',
                          file.type === 'folder'
                            ? 'bg-utility-neutral-50 text-utility-neutral-600'
                            : 'bg-utility-green-50 text-utility-green-600',
                        )}
                      >
                        {file.type === 'folder' ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M1.333 4.667V3.2c0-.747 0-1.12.145-1.405a1.333 1.333 0 01.583-.583C2.346 1.067 2.72 1.067 3.467 1.067h1.72c.326 0 .49 0 .641.04.134.036.26.096.373.177.128.091.232.22.44.476l.718.88c.208.257.312.385.44.476.113.081.24.141.374.177.15.04.314.04.64.04h3.387c.747 0 1.12 0 1.405.146.263.128.476.341.583.583.146.285.146.658.146 1.405v.2m0 0v5.866c0 .747 0 1.12-.146 1.406-.127.262-.32.455-.583.583-.285.146-.658.146-1.405.146H3.2c-.747 0-1.12 0-1.405-.146a1.333 1.333 0 01-.583-.583c-.145-.286-.145-.659-.145-1.406V4.667"
                              stroke="currentColor"
                              strokeWidth="1.33"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M9.333 1.513v2.754c0 .373 0 .56.073.702a.667.667 0 00.291.291c.143.073.33.073.703.073h2.754M9.333 11.333H5.333m4 -2.666H5.333M13.333 6.56V11.467c0 1.12 0 1.68-.218 2.108a2 2 0 01-.874.874c-.428.218-.988.218-2.108.218H5.867c-1.12 0-1.68 0-2.108-.218a2 2 0 01-.874-.874c-.218-.428-.218-.988-.218-2.108V4.533c0-1.12 0-1.68.218-2.108a2 2 0 01.874-.874c.428-.218.988-.218 2.108-.218H7.44c.495 0 .743 0 .975.055.206.048.402.13.579.24.2.125.368.3.706.65l2.598 2.7c.326.338.489.508.607.704.105.174.183.365.229.565.051.227.051.468.051.953z"
                              stroke="currentColor"
                              strokeWidth="1.33"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>

                      {/* Name + meta */}
                      <div className="min-w-0 flex-1">
                        <p className="text-primary truncate text-sm font-medium">{file.name}</p>
                        {file.type === 'file' && file.size != null && (
                          <p className="text-tertiary text-xs">{formatFileSize(file.size)}</p>
                        )}
                      </div>

                      {/* Chevron for folders */}
                      {file.type === 'folder' && (
                        <svg
                          className="text-quaternary shrink-0"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M6 12l4-4-4-4"
                            stroke="currentColor"
                            strokeWidth="1.33"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Preview panel */}
          <div className="flex w-1/2 flex-col">
            {state === 'browsing' && !selectedFile && (
              <div className="flex flex-1 items-center justify-center px-6">
                <p className="text-tertiary text-center text-sm">
                  Sélectionnez un fichier pour voir un aperçu.
                </p>
              </div>
            )}

            {isLoadingPreview && (
              <div className="flex flex-1 items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Spinner className="text-tertiary" />
                  <p className="text-tertiary text-sm">Chargement de l'aperçu...</p>
                </div>
              </div>
            )}

            {state === 'previewing' && preview && !isLoadingPreview && (
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="border-secondary border-b px-4 py-3">
                  <p className="text-primary text-sm font-semibold">{selectedFile?.name}</p>
                  <p className="text-tertiary text-xs">
                    {preview.totalRows} ligne{preview.totalRows > 1 ? 's' : ''} &middot;{' '}
                    {preview.columns.length} colonne{preview.columns.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-secondary sticky top-0">
                      <tr>
                        {preview.columns.map((col) => (
                          <th
                            key={col}
                            className="text-tertiary whitespace-nowrap px-3 py-2 font-medium"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-secondary divide-y">
                      {preview.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-secondary transition">
                          {preview.columns.map((col) => (
                            <td
                              key={col}
                              className="text-primary max-w-[140px] truncate whitespace-nowrap px-3 py-2"
                            >
                              {String(row[col] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {state === 'error' && selectedFile && (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
                <div className="bg-utility-red-50 text-utility-red-700 rounded-full p-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 6.5v3.333M10 13.5h.008M18.333 10a8.333 8.333 0 11-16.667 0 8.333 8.333 0 0116.667 0z"
                      stroke="currentColor"
                      strokeWidth="1.67"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-tertiary text-center text-sm">{errorMessage}</p>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedFile) void fetchPreview(selectedFile.id);
                  }}
                  className="text-brand-700 hover:text-brand-800 text-sm font-semibold transition"
                >
                  Réessayer
                </button>
              </div>
            )}

            {state === 'connecting' && (
              <div className="flex flex-1 items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Spinner className="text-brand-600" />
                  <p className="text-tertiary text-sm">Connexion en cours...</p>
                </div>
              </div>
            )}

            {state === 'connected' && (
              <div className="flex flex-1 items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-utility-green-50 text-utility-green-600 rounded-full p-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M16.667 5L7.5 14.167 3.333 10"
                        stroke="currentColor"
                        strokeWidth="1.67"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="text-primary text-sm font-semibold">Connecté !</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-secondary flex items-center justify-between border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="border-primary text-secondary hover:bg-secondary rounded-lg border px-4 py-2.5 text-sm font-semibold shadow-xs transition"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => void handleConnect()}
            disabled={!selectedFile || state === 'connecting' || state === 'connected'}
            className={cx(
              'rounded-lg px-4 py-2.5 text-sm font-semibold shadow-xs transition',
              selectedFile && state !== 'connecting' && state !== 'connected'
                ? 'bg-brand-solid text-white hover:bg-brand-solid_hover'
                : 'bg-disabled text-disabled cursor-not-allowed',
            )}
          >
            {state === 'connecting' ? (
              <span className="flex items-center gap-2">
                <Spinner className="size-4" />
                Connexion...
              </span>
            ) : state === 'connected' ? (
              'Connecté'
            ) : (
              'Connecter'
            )}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
