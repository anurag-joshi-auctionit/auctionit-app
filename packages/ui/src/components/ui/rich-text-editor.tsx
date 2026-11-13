import * as React from "react";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
  type JSONContent,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import {
  Bold01,
  Dotpoints01,
  Eraser,
  Italic01,
  ReverseLeft,
  ReverseRight,
  Strikethrough01,
  Underline01,
} from "@untitledui/icons";

import { cn } from "../../lib/utils";
import { Button } from "./button";

export type { JSONContent as RichTextContent } from "@tiptap/react";

export interface RichTextEditorProps {
  value?: JSONContent | null;
  onChange?: (value: JSONContent) => void;
  placeholder?: string;
  editable?: boolean;
  id?: string;
  className?: string;
  contentClassName?: string;
  "aria-invalid"?: boolean | "true" | "false";
}

function OrderedListIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M10 6h11M10 12h11M10 18h11" />
      <path d="M4 5h1v4" />
      <path d="M4 9h2" />
      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </svg>
  );
}

const extensions = (placeholder?: string) => [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    blockquote: false,
    code: false,
    codeBlock: false,
    horizontalRule: false,
    link: false,
  }),
  Placeholder.configure({ placeholder: placeholder ?? "" }),
];

function Toolbar({ editor, disabled }: { editor: Editor; disabled?: boolean }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const items: {
    key: string;
    label: string;
    icon: React.ReactNode;
    active?: boolean;
    enabled?: boolean;
    run: () => void;
  }[] = [
    {
      key: "bold",
      label: "Bold",
      icon: <Bold01 />,
      active: state.bold,
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      key: "italic",
      label: "Italic",
      icon: <Italic01 />,
      active: state.italic,
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      key: "underline",
      label: "Underline",
      icon: <Underline01 />,
      active: state.underline,
      run: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      key: "strike",
      label: "Strikethrough",
      icon: <Strikethrough01 />,
      active: state.strike,
      run: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      key: "bulletList",
      label: "Bulleted List",
      icon: <Dotpoints01 />,
      active: state.bulletList,
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      key: "orderedList",
      label: "Numbered List",
      icon: <OrderedListIcon />,
      active: state.orderedList,
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      key: "undo",
      label: "Undo",
      icon: <ReverseLeft />,
      enabled: state.canUndo,
      run: () => editor.chain().focus().undo().run(),
    },
    {
      key: "redo",
      label: "Redo",
      icon: <ReverseRight />,
      enabled: state.canRedo,
      run: () => editor.chain().focus().redo().run(),
    },
    {
      key: "clear",
      label: "Clear Formatting",
      icon: <Eraser />,
      run: () => editor.chain().focus().unsetAllMarks().clearNodes().run(),
    },
  ];

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="bg-muted/40 flex flex-wrap items-center gap-0.5 border-b px-1.5 py-1"
    >
      {items.map((item) => (
        <Button
          key={item.key}
          type="button"
          variant={item.active ? "secondary" : "ghost"}
          size="icon-sm"
          tooltip={item.label}
          aria-label={item.label}
          aria-pressed={item.active}
          disabled={disabled || item.enabled === false}
          onMouseDown={(event) => event.preventDefault()}
          onClick={item.run}
        >
          {item.icon}
        </Button>
      ))}
    </div>
  );
}

const contentStyles =
  "[&_.ProseMirror]:outline-none [&_.ProseMirror_p]:my-1.5 [&_.ProseMirror_ul]:my-1.5 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ol]:my-1.5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_li_p]:my-0.5 [&_.ProseMirror_h1]:my-2 [&_.ProseMirror_h1]:text-xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h2]:my-2 [&_.ProseMirror_h2]:text-lg [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h3]:my-2 [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]";

/** Basic rich-text editor (bold, italic, underline, strike, lists). Value is Tiptap JSON. */
function RichTextEditor({
  value,
  onChange,
  placeholder,
  editable = true,
  id,
  className,
  contentClassName,
  "aria-invalid": ariaInvalid,
}: RichTextEditorProps) {
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    extensions: extensions(placeholder),
    content: value ?? "",
    editable,
    immediatelyRender: true,
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        class: cn(
          "text-sm leading-relaxed",
          editable ? "min-h-40 px-3 py-2" : "",
          contentClassName,
        ),
      },
    },
    onUpdate: ({ editor: e }) => onChangeRef.current?.(e.getJSON()),
  });

  React.useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  React.useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const next = value ?? { type: "doc", content: [{ type: "paragraph" }] };
    if (JSON.stringify(next) !== current) {
      editor.commands.setContent(value ?? "", { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editable) {
    return (
      <div data-slot="rich-text-view" className={cn(contentStyles, className)}>
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <div
      data-slot="rich-text-editor"
      aria-invalid={ariaInvalid}
      className={cn(
        "border-input focus-within:border-ring aria-invalid:border-destructive overflow-hidden rounded-md border bg-transparent",
        contentStyles,
        className,
      )}
    >
      {editor ? <Toolbar editor={editor} /> : null}
      <EditorContent editor={editor} />
    </div>
  );
}

/** True when the editor JSON has no visible text. */
function isRichTextEmpty(value: JSONContent | null | undefined): boolean {
  if (!value) return true;
  const hasText = (node: JSONContent): boolean =>
    Boolean(node.text?.trim()) || (node.content ?? []).some(hasText);
  return !hasText(value);
}

export { RichTextEditor, isRichTextEmpty };
