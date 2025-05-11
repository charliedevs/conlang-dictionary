import Typography from "@tiptap/extension-typography";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  BoldIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  StrikethroughIcon,
} from "lucide-react";
import { forwardRef, type ReactNode } from "react";
import { cn } from "~/lib/utils";
import { Separator } from "./ui/separator";
import { Toggle } from "./ui/toggle";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  showOrderedList?: boolean;
  customToolbarActions?: ReactNode;
  className?: string;
  disabled?: boolean;
}

export const TextEditor = forwardRef<HTMLDivElement, TextEditorProps>(
  (
    {
      value,
      onChange,
      showOrderedList = false,
      customToolbarActions,
      className,
      disabled = false,
    },
    ref,
  ) => {
    const editor = useEditor({
      editorProps: {
        attributes: {
          class: cn(
            "min-h-[150px] max-h-[300px] w-full rounded-md rounded-br-none rounded-bl-none border border-input bg-background px-3 py-2 border-b-0 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 overflow-auto",
            className,
          ),
        },
      },
      extensions: [
        StarterKit.configure({
          paragraph: {
            HTMLAttributes: {
              class: "prose prose-sm mb-1 dark:prose-invert",
            },
          },
          ...(showOrderedList && {
            orderedList: {
              HTMLAttributes: {
                class: "list-decimal pl-4",
              },
            },
          }),
          bulletList: {
            HTMLAttributes: {
              class: "list-disc pl-4",
            },
          },
        }),
        Typography,
      ],
      content: value,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        onChange(html);
      },
      editable: !disabled,
    });

    return (
      <div
        id="textEditor"
        ref={ref}
        className={disabled ? "pointer-events-none opacity-50" : ""}
      >
        <EditorContent editor={editor} disabled={disabled} />
        {editor && !disabled ? (
          <RichTextEditorToolbar
            editor={editor}
            showOrderedList={showOrderedList}
            customToolbarActions={customToolbarActions}
          />
        ) : null}
      </div>
    );
  },
);

TextEditor.displayName = "TextEditor";

interface RichTextEditorToolbarProps {
  editor: Editor;
  showOrderedList?: boolean;
  customToolbarActions?: ReactNode;
}

const RichTextEditorToolbar = ({
  editor,
  showOrderedList = false,
  customToolbarActions,
}: RichTextEditorToolbarProps) => {
  return (
    <div className="flex flex-row items-center justify-between gap-1 rounded-bl-md rounded-br-md border border-input bg-transparent p-1 dark:bg-background">
      <div className="flex flex-row items-center gap-1">
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldIcon className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("strike")}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        >
          <StrikethroughIcon className="h-4 w-4" />
        </Toggle>
        <Separator orientation="vertical" className="h-8 w-[1px]" />
        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
        >
          <ListIcon className="h-4 w-4" />
        </Toggle>
        {showOrderedList && (
          <Toggle
            size="sm"
            pressed={editor.isActive("orderedList")}
            onPressedChange={() =>
              editor.chain().focus().toggleOrderedList().run()
            }
          >
            <ListOrderedIcon className="h-4 w-4" />
          </Toggle>
        )}
      </div>
      <div className="flex flex-row items-center gap-1">
        {customToolbarActions}
      </div>
    </div>
  );
};
