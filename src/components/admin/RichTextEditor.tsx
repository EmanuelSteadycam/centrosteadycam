"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Youtube from "@tiptap/extension-youtube";
import { Node } from "@tiptap/core";
import { useEffect, useReducer, useRef, useState } from "react";

const ButtonGroup = Node.create({
  name: "buttonGroup",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      b1label: { default: "Info e iscrizioni", parseHTML: el => el.getAttribute("data-b1label") || "Info e iscrizioni" },
      b1href:  { default: "#",                 parseHTML: el => el.getAttribute("data-b1href")  || "#" },
      b2label: { default: null,                parseHTML: el => el.getAttribute("data-b2label") || null },
      b2href:  { default: null,                parseHTML: el => el.getAttribute("data-b2href")  || null },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="button-group"]' }];
  },
  renderHTML({ node }) {
    const { b1label, b1href, b2label, b2href } = node.attrs;
    const children: unknown[] = [
      ["a", { href: b1href, class: "btn-green-block", target: "_blank", rel: "noopener noreferrer" }, b1label],
    ];
    if (b2label && b2href) {
      children.push(["a", { href: b2href, class: "btn-green-block", target: "_blank", rel: "noopener noreferrer" }, b2label]);
    }
    return ["div", {
      "data-type": "button-group",
      "data-b1label": b1label,
      "data-b1href":  b1href,
      "data-b2label": b2label ?? "",
      "data-b2href":  b2href  ?? "",
      class: "btn-group-block",
    }, ...children];
  },
});

const BTN = "px-2 py-1 text-xs rounded hover:bg-gray-100 transition-colors disabled:opacity-40";
const BTN_ACTIVE = "bg-gray-200 font-semibold";

const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "gif", "svg"];

function isImage(url: string) {
  const ext = url.split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_EXTS.includes(ext);
}

type ArchiveFile = { name: string; url: string; size: number };

type ModalState = {
  selectedUrl: string | null;
  selectedName: string;
  uploading: boolean;
  b1label: string;
  b2label: string;
  b2href: string;
  archiveFiles: ArchiveFile[] | null;
  loadingArchive: boolean;
};

const MODAL_INIT: ModalState = {
  selectedUrl: null,
  selectedName: "",
  uploading: false,
  b1label: "Scarica",
  b2label: "",
  b2href: "",
  archiveFiles: null,
  loadingArchive: false,
};

export default function RichTextEditor({
  value,
  onChange,
  onUploadFile,
  onListFiles,
}: {
  value: string;
  onChange: (html: string) => void;
  onUploadFile?: (file: File) => Promise<string | null>;
  onListFiles?: () => Promise<ArchiveFile[]>;
}) {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const [modal, setModal] = useState<ModalState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      ButtonGroup,
      Youtube.configure({ width: 640, height: 360, nocookie: true }),
      StarterKit.configure({
        link: {
          openOnClick: false,
          HTMLAttributes: {
            target: "_blank",
            rel: "noopener noreferrer",
            class: "editor-link",
          },
        },
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: () => forceUpdate(),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[400px] px-4 py-3 focus:outline-none",
      },
      handleClick(_, __, event) {
        if ((event.target as HTMLElement).closest("a")) event.preventDefault();
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) return null;

  const btn = (active: boolean) => `${BTN} ${active ? BTN_ACTIVE : ""}`;
  const isLink = editor.isActive("link");
  const currentLinkHref = (editor.getAttributes("link").href as string | undefined) ?? "";

  const handleLink = () => {
    if (isLink) {
      const url = window.prompt("URL del collegamento (vuoto = rimuovi):", currentLinkHref);
      if (url === null) return;
      if (!url.trim()) { editor.chain().focus().unsetLink().run(); return; }
      editor.chain().focus().setLink({ href: url.trim() }).run();
      return;
    }
    const url = window.prompt("URL del collegamento:", "https://");
    if (url?.trim()) editor.chain().focus().setLink({ href: url.trim() }).run();
  };

  const openModal = async () => {
    const m: ModalState = { ...MODAL_INIT };
    if (onListFiles) {
      m.loadingArchive = true;
      setModal(m);
      const files = await onListFiles();
      setModal((prev) => prev ? { ...prev, archiveFiles: files, loadingArchive: false } : null);
    } else {
      setModal(m);
    }
  };

  const insertButtons = () => {
    if (!modal?.selectedUrl || !modal.b1label.trim() || !editor) return;
    editor.chain().focus().insertContent({
      type: "buttonGroup",
      attrs: {
        b1label: modal.b1label.trim(),
        b1href: modal.selectedUrl,
        b2label: modal.b2label.trim() || null,
        b2href: modal.b2href.trim() || null,
      },
    }).run();
    setModal(null);
  };

  return (
    <>
      <div className="border border-gray-200 rounded overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50 [&>span:last-of-type]:hidden">
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))}>
            <strong>B</strong>
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))}>
            <em>I</em>
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive("strike"))}>
            <s>S</s>
          </button>
          <span className="w-px bg-gray-200 mx-1 self-stretch" />
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}>
            H2
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))}>
            H3
          </button>
          <span className="w-px bg-gray-200 mx-1 self-stretch" />
          <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}>
            • Lista
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))}>
            1. Lista
          </button>
          <span className="w-px bg-gray-200 mx-1 self-stretch" />
          <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))}>
            &quot; Quote
          </button>
          <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={BTN}>
            — Linea
          </button>
          <span className="w-px bg-gray-200 mx-1 self-stretch" />
          <button type="button" onClick={handleLink} className={btn(isLink)}>
            🔗 {isLink ? "Modifica link" : "Link"}
          </button>
          <span className="w-px bg-gray-200 mx-1 self-stretch" />
          <button type="button" onClick={() => {
            const url = window.prompt("URL video YouTube o Vimeo:", "https://");
            if (url?.trim()) editor.commands.setYoutubeVideo({ src: url.trim() });
          }} className={BTN}>
            ▶ Video
          </button>
          <button type="button" onClick={() => {
            const b1label = window.prompt("Testo pulsante 1:", "Info e iscrizioni");
            if (!b1label?.trim()) return;
            const b1href = window.prompt("URL pulsante 1:", "https://");
            if (!b1href?.trim()) return;
            const b2label = window.prompt("Testo pulsante 2 (lascia vuoto per 1 solo):", "");
            const b2href = b2label?.trim() ? window.prompt("URL pulsante 2:", "https://") : null;
            editor.chain().focus().insertContent({
              type: "buttonGroup",
              attrs: { b1label: b1label.trim(), b1href: b1href.trim(), b2label: b2label?.trim() || null, b2href: b2href?.trim() || null },
            }).run();
          }} className={BTN}>
            🟢 Pulsanti
          </button>
          {onUploadFile && (
            <>
              <span className="w-px bg-gray-200 mx-1 self-stretch" />
              <button type="button" onClick={openModal} className={BTN}>
                📎 Allega
              </button>
            </>
          )}
          <span className="w-px bg-gray-200 mx-1 self-stretch" />
          <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={BTN}>↩</button>
          <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={BTN}>↪</button>
        </div>

        <EditorContent editor={editor} />
      </div>

      {/* Modal allegato */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setModal(null)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">📎 Inserisci allegato</h3>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* Upload nuovo */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Carica nuovo file</p>
                <label className={`cursor-pointer inline-block text-xs px-3 py-2 rounded border transition-colors ${modal.uploading ? "border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:border-gray-500"}`}>
                  {modal.uploading ? "Caricamento…" : "+ Scegli file"}
                  <input
                    type="file"
                    className="hidden"
                    disabled={modal.uploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !onUploadFile) return;
                      setModal((m) => m ? { ...m, uploading: true } : null);
                      const url = await onUploadFile(file);
                      e.target.value = "";
                      if (!url) { setModal((m) => m ? { ...m, uploading: false } : null); return; }
                      setModal((m) => m ? { ...m, uploading: false, selectedUrl: url, selectedName: file.name } : null);
                    }}
                  />
                </label>
              </div>

              {/* Archivio */}
              {onListFiles && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">— o scegli dall&apos;archivio —</p>
                  {modal.loadingArchive ? (
                    <p className="text-xs text-gray-400">Caricamento archivio…</p>
                  ) : modal.archiveFiles?.length === 0 ? (
                    <p className="text-xs text-gray-400">Nessun file in archivio.</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {modal.archiveFiles?.map((f) => (
                        <button
                          key={f.url}
                          type="button"
                          onClick={() => setModal((m) => m ? { ...m, selectedUrl: f.url, selectedName: f.name } : null)}
                          className={`relative rounded border-2 overflow-hidden transition-colors text-left ${modal.selectedUrl === f.url ? "border-green-500" : "border-gray-200 hover:border-gray-400"}`}
                        >
                          {isImage(f.url) ? (
                            <img src={f.url} alt={f.name} className="w-full h-16 object-cover" />
                          ) : (
                            <div className="w-full h-16 flex items-center justify-center bg-gray-50 text-2xl">📄</div>
                          )}
                          <p className="text-[9px] text-gray-500 truncate px-1 py-0.5 bg-white">{f.name}</p>
                          {modal.selectedUrl === f.url && (
                            <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px]">✓</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* File selezionato + config pulsanti */}
              {modal.selectedUrl && (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <p className="text-xs text-green-700 font-medium">✓ {modal.selectedName}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Testo pulsante 1 *</label>
                      <input
                        type="text"
                        value={modal.b1label}
                        onChange={(e) => setModal((m) => m ? { ...m, b1label: e.target.value } : null)}
                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-gray-400"
                      />
                    </div>
                    <div className="text-xs text-gray-400 flex items-end pb-1.5">→ {modal.selectedUrl.split("/").pop()}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Testo pulsante 2 (opz.)</label>
                      <input
                        type="text"
                        value={modal.b2label}
                        onChange={(e) => setModal((m) => m ? { ...m, b2label: e.target.value } : null)}
                        placeholder="es. Maggiori info"
                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">URL pulsante 2</label>
                      <input
                        type="text"
                        value={modal.b2href}
                        onChange={(e) => setModal((m) => m ? { ...m, b2href: e.target.value } : null)}
                        placeholder="https://..."
                        disabled={!modal.b2label.trim()}
                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-gray-400 disabled:opacity-40"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button type="button" onClick={() => setModal(null)} className="text-xs px-4 py-2 border border-gray-200 rounded text-gray-500 hover:text-gray-800 transition-colors">
                Annulla
              </button>
              <button
                type="button"
                onClick={insertButtons}
                disabled={!modal.selectedUrl || !modal.b1label.trim()}
                className="text-xs px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-40"
              >
                Inserisci pulsante
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
