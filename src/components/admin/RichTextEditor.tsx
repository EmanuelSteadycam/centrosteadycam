"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Youtube from "@tiptap/extension-youtube";
import { Node, mergeAttributes } from "@tiptap/core";
import { useEffect, useReducer } from "react";

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

export default function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

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
      editor.commands.setContent(value, false);
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
            " Quote
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
          <span className="w-px bg-gray-200 mx-1 self-stretch" />
          <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className={BTN}>↩</button>
          <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className={BTN}>↪</button>
        </div>

        <EditorContent editor={editor} />
      </div>
    </>
  );
}
