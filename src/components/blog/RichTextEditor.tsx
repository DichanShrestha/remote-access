'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import {
  Bold,
  Check,
  ChevronDown,
  Code,
  Code2,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
  Upload,
  X,
} from 'lucide-react';
import { isValidEditorHref, normalizeEditorHref } from '@/lib/blog-editor';

export type RichTextEditorHandle = {
  getHTML: () => string;
  setHTML: (html: string) => void;
  replaceAll: (html: string) => void;
  focus: () => void;
  getSelectedText: () => string;
  replaceSelection: (html: string) => void;
  replaceHeading: (currentText: string, nextText: string) => boolean;
  insertHTML: (html: string) => void;
  appendHTML: (html: string) => void;
};

type RichTextEditorProps = {
  documentId: string;
  initialHtml: string;
  onChange: (html: string) => void;
  onSaveShortcut?: () => void;
  onUploadImage?: (file: File) => Promise<string>;
  readOnly?: boolean;
  className?: string;
};

type BlockValue = 'paragraph' | 'h2' | 'h3' | 'blockquote' | 'codeBlock';

const BLOCK_LABELS: Record<BlockValue, string> = {
  paragraph: 'Paragraph',
  h2: 'Heading 2',
  h3: 'Heading 3',
  blockquote: 'Quote',
  codeBlock: 'Code block',
};

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition ${active
        ? 'bg-[#292a25] text-[#fdfcf8]'
        : 'text-[#5f6058] hover:bg-[#efede6] hover:text-[#1f201c]'
        } disabled:cursor-not-allowed disabled:opacity-35`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-[#e2dfd6]" aria-hidden="true" />;
}

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  function RichTextEditor(
    {
      documentId,
      initialHtml,
      onChange,
      onSaveShortcut,
      onUploadImage,
      readOnly = false,
      className = '',
    },
    ref,
  ) {
    const onChangeRef = useRef(onChange);
    const onSaveShortcutRef = useRef(onSaveShortcut);
    const suppressUpdateRef = useRef(false);

    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
      onSaveShortcutRef.current = onSaveShortcut;
    }, [onSaveShortcut]);

    const [linkOpen, setLinkOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [linkNewTab, setLinkNewTab] = useState(true);
    const [dialogError, setDialogError] = useState('');
    const linkInputRef = useRef<HTMLInputElement>(null);

    const [imageOpen, setImageOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [imageAlt, setImageAlt] = useState('');
    const [uploading, setUploading] = useState(false);
    const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
    const imageInputRef = useRef<HTMLInputElement>(null);
    const imageUrlInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
      immediatelyRender: false,
      editable: !readOnly,
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3] },
          link: {
            openOnClick: false,
            autolink: true,
            linkOnPaste: true,
            defaultProtocol: 'https',
            HTMLAttributes: {
              rel: 'noopener noreferrer nofollow',
              target: '_blank',
            },
          },
        }),
        Highlight.configure({ multicolor: false }),
        Image.configure({ inline: false, allowBase64: false }),
        Placeholder.configure({
          placeholder: ({ node }) =>
            node.type.name === 'heading' ? 'Section heading' : 'Start writing your story…',
          includeChildren: true,
        }),
      ],
      content: initialHtml,
      editorProps: {
        attributes: {
          class: 'article-prose tiptap',
          'aria-label': 'Article body',
          spellcheck: 'true',
        },
      },
      onUpdate: ({ editor: current }) => {
        if (suppressUpdateRef.current) return;
        onChangeRef.current(current.getHTML());
      },
    });

    const toolbar = useEditorState({
      editor,
      selector: ({ editor: current }) => {
        if (!current) return null;
        const text = current.state.doc.textContent;
        return {
          isBold: current.isActive('bold'),
          isItalic: current.isActive('italic'),
          isUnderline: current.isActive('underline'),
          isStrike: current.isActive('strike'),
          isCode: current.isActive('code'),
          isHighlight: current.isActive('highlight'),
          isBulletList: current.isActive('bulletList'),
          isOrderedList: current.isActive('orderedList'),
          isBlockquote: current.isActive('blockquote'),
          isCodeBlock: current.isActive('codeBlock'),
          isH2: current.isActive('heading', { level: 2 }),
          isH3: current.isActive('heading', { level: 3 }),
          isLink: current.isActive('link'),
          canUndo: current.can().undo(),
          canRedo: current.can().redo(),
          hasSelection: !current.state.selection.empty,
          words: text.split(/\s+/).filter(Boolean).length,
          characters: text.length,
        };
      },
    });

    const blockValue: BlockValue = toolbar?.isH2
      ? 'h2'
      : toolbar?.isH3
        ? 'h3'
        : toolbar?.isBlockquote
          ? 'blockquote'
          : toolbar?.isCodeBlock
            ? 'codeBlock'
            : 'paragraph';

    useEffect(() => {
      if (!editor) return;
      suppressUpdateRef.current = true;
      editor.commands.setContent(initialHtml || '', { emitUpdate: false });
      suppressUpdateRef.current = false;
      // The editor instance intentionally persists; reset only when the article
      // changes. Closing the dialogs is deferred so the effect itself does not
      // trigger a synchronous cascading render.
      const closeTimer = window.setTimeout(() => {
        setLinkOpen(false);
        setImageOpen(false);
        setDialogError('');
      }, 0);
      return () => window.clearTimeout(closeTimer);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [documentId, editor]);

    const openLinkDialog = () => {
      if (!editor) return;
      const attributes = editor.getAttributes('link') as { href?: string };
      const { from, to } = editor.state.selection;
      setLinkUrl(attributes.href || '');
      setLinkText(from === to ? '' : editor.state.doc.textBetween(from, to, ' '));
      setLinkNewTab(true);
      setDialogError('');
      setLinkOpen(true);
      setImageOpen(false);
      window.setTimeout(() => linkInputRef.current?.focus(), 30);
    };

    useEffect(() => {
      if (!linkOpen && !imageOpen) return;
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') return;
        setLinkOpen(false);
        setImageOpen(false);
        setDialogError('');
      };
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }, [linkOpen, imageOpen]);

    useEffect(() => {
      const onKeyDown = (event: KeyboardEvent) => {
        const modifier = event.metaKey || event.ctrlKey;
        if (!modifier) return;
        if (event.key.toLowerCase() === 's') {
          event.preventDefault();
          onSaveShortcutRef.current?.();
        }
        if (event.key.toLowerCase() === 'k') {
          if (!editor) return;
          event.preventDefault();
          openLinkDialog();
        }
      };
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor]);

    useImperativeHandle(
      ref,
      () => ({
        getHTML: () => editor?.getHTML() ?? initialHtml,
        setHTML: (html: string) => {
          if (!editor) return;
          suppressUpdateRef.current = true;
          editor.commands.setContent(html || '', { emitUpdate: false });
          suppressUpdateRef.current = false;
          onChangeRef.current(editor.getHTML());
        },
        replaceAll: (html: string) => {
          if (!editor) return;
          // setContent dispatches a replace transaction, so the change lands on
          // the undo stack instead of wiping the user's history.
          suppressUpdateRef.current = false;
          editor.chain().focus().setContent(html || '', { emitUpdate: true }).run();
        },
        focus: () => editor?.commands.focus(),
        getSelectedText: () => {
          if (!editor) return '';
          const { from, to } = editor.state.selection;
          return from === to ? '' : editor.state.doc.textBetween(from, to, ' ');
        },
        replaceSelection: (html: string) => {
          if (!editor) return;
          editor.chain().focus().insertContent(html).run();
          onChangeRef.current(editor.getHTML());
        },
        replaceHeading: (currentText: string, nextText: string) => {
          if (!editor) return false;
          const target = currentText.trim().toLowerCase();
          const replacement = nextText.trim();
          if (!target || !replacement) return false;

          const { state } = editor;
          const findHeading = (): { pos: number; node: ProseMirrorNode } | null => {
            let found: { pos: number; node: ProseMirrorNode } | null = null;
            state.doc.descendants((node, pos) => {
              if (found) return false;
              if (node.type.name !== 'heading') return;
              if (node.textContent.trim().toLowerCase() !== target) return;
              found = { pos, node };
              return false;
            });
            return found;
          };
          const match = findHeading();
          if (!match) return false;

          const transaction = state.tr.replaceWith(
            match.pos,
            match.pos + match.node.nodeSize,
            state.schema.nodes.heading.create(
              match.node.attrs,
              state.schema.text(replacement),
            ),
          );
          editor.view.dispatch(transaction);
          editor.commands.focus();
          onChangeRef.current(editor.getHTML());
          return true;
        },
        insertHTML: (html: string) => {
          if (!editor) return;
          editor.chain().focus().insertContent(html).run();
          onChangeRef.current(editor.getHTML());
        },
        appendHTML: (html: string) => {
          if (!editor) return;
          editor.chain().focus('end').insertContent(html).run();
          onChangeRef.current(editor.getHTML());
        },
      }),
      [editor, initialHtml],
    );

    const applyLink = () => {
      if (!editor) return;
      const href = normalizeEditorHref(linkUrl);
      if (!isValidEditorHref(linkUrl)) {
        setDialogError('Enter a valid link such as https://example.com, /about, or mailto:hi@example.com.');
        return;
      }
      const attributes = {
        href,
        target: linkNewTab ? '_blank' : null,
        rel: linkNewTab ? 'noopener noreferrer nofollow' : 'nofollow',
      };
      const { empty } = editor.state.selection;
      if (!empty) {
        editor.chain().focus().extendMarkRange('link').setLink(attributes).run();
      } else {
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'text',
            text: linkText.trim() || href,
            marks: [{ type: 'link', attrs: attributes }],
          })
          .run();
      }
      setLinkOpen(false);
      setDialogError('');
    };

    const removeLink = () => {
      if (!editor) return;
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setLinkOpen(false);
    };

    const openImageDialog = () => {
      setImageUrl('');
      setImageAlt('');
      setDialogError('');
      setImageTab(onUploadImage ? 'upload' : 'url');
      setImageOpen(true);
      setLinkOpen(false);
      window.setTimeout(() => imageInputRef.current?.focus(), 30);
    };

    const handleImageFile = async (file: File) => {
      if (!onUploadImage) return;
      setUploading(true);
      setDialogError('');
      try {
        const url = await onUploadImage(file);
        setImageUrl(url);
        setImageTab('url');
        window.setTimeout(() => imageUrlInputRef.current?.focus(), 30);
      } catch (error) {
        setDialogError(error instanceof Error ? error.message : 'The image could not be uploaded.');
      } finally {
        setUploading(false);
      }
    };

    const insertImage = () => {
      if (!editor) return;
      const src = imageUrl.trim();
      const valid = /^https?:\/\//i.test(src) || (src.startsWith('/') && !src.startsWith('//'));
      if (!valid) {
        setDialogError('Use an https image URL or upload an image.');
        return;
      }
      editor
        .chain()
        .focus()
        .setImage({ src, alt: imageAlt.trim() || undefined, title: imageAlt.trim() || undefined })
        .run();
      setImageOpen(false);
      setDialogError('');
    };

    const setBlock = (value: BlockValue) => {
      if (!editor) return;
      const chain = editor.chain().focus();
      if (value === 'paragraph') chain.setParagraph().run();
      else if (value === 'h2') chain.setHeading({ level: 2 }).run();
      else if (value === 'h3') chain.setHeading({ level: 3 }).run();
      else if (value === 'blockquote') chain.setParagraph().toggleBlockquote().run();
      else if (value === 'codeBlock') chain.setParagraph().toggleCodeBlock().run();
    };

    return (
      <div className={`relative flex min-h-0 flex-col ${className}`}>
        <div className="sticky top-0 z-20 border-b border-[#e8e5dd] bg-[#fffefb]/95 backdrop-blur">
          <div className="flex flex-wrap items-center gap-1 px-3 py-2 sm:px-4">
            <label className="relative mr-1">
              <span className="sr-only">Text style</span>
              <select
                value={blockValue}
                onChange={(event) => setBlock(event.target.value as BlockValue)}
                disabled={!editor || readOnly}
                className="h-8 appearance-none rounded-md border border-[#e2dfd6] bg-white pl-2.5 pr-7 text-[12px] font-medium text-[#4e4f48] outline-none transition hover:border-[#c9c5ba] focus:border-[#292a25]"
              >
                {Object.entries(BLOCK_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8b8c83]" />
            </label>

            <Divider />
            <ToolbarButton
              label="Bold (⌘B)"
              active={toolbar?.isBold}
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Italic (⌘I)"
              active={toolbar?.isItalic}
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Underline (⌘U)"
              active={toolbar?.isUnderline}
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
            >
              <Underline className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Strikethrough"
              active={toolbar?.isStrike}
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Inline code"
              active={toolbar?.isCode}
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleCode().run()}
            >
              <Code className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Highlight"
              active={toolbar?.isHighlight}
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleHighlight().run()}
            >
              <Highlighter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Link (⌘K)"
              active={toolbar?.isLink || linkOpen}
              disabled={!editor}
              onClick={openLinkDialog}
            >
              <Link2 className="h-4 w-4" />
            </ToolbarButton>

            <Divider />
            <ToolbarButton
              label="Bullet list"
              active={toolbar?.isBulletList}
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Numbered list"
              active={toolbar?.isOrderedList}
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Quote"
              active={toolbar?.isBlockquote}
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Code block"
              active={toolbar?.isCodeBlock}
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            >
              <Code2 className="h-4 w-4" />
            </ToolbarButton>

            <Divider />
            <ToolbarButton
              label="Insert image"
              active={imageOpen}
              disabled={!editor}
              onClick={openImageDialog}
            >
              <ImageIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              label="Divider"
              disabled={!editor}
              onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            >
              <Minus className="h-4 w-4" />
            </ToolbarButton>

            <span className="ml-auto hidden items-center gap-1 sm:flex">
              <ToolbarButton
                label="Undo"
                disabled={!toolbar?.canUndo}
                onClick={() => editor?.chain().focus().undo().run()}
              >
                <Undo2 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Redo"
                disabled={!toolbar?.canRedo}
                onClick={() => editor?.chain().focus().redo().run()}
              >
                <Redo2 className="h-4 w-4" />
              </ToolbarButton>
              <ToolbarButton
                label="Clear formatting"
                disabled={!editor}
                onClick={() =>
                  editor?.chain().focus().unsetAllMarks().clearNodes().run()
                }
              >
                <RemoveFormatting className="h-4 w-4" />
              </ToolbarButton>
            </span>
          </div>
        </div>

        {linkOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-[#1b1c17]/45 backdrop-blur-[2px]"
              aria-label="Close link dialog"
              onClick={() => setLinkOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Add link"
              className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-xl border border-[#ddd9cf] bg-[#fffefb] p-4 shadow-[0_24px_70px_rgba(38,37,31,0.24)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-[#26271f]">
                  {toolbar?.isLink ? 'Edit link' : 'Add link'}
                </p>
                <button
                  type="button"
                  onClick={() => setLinkOpen(false)}
                  className="rounded p-1 text-[#8b8c83] hover:bg-[#f1efe8] hover:text-[#26271f]"
                  aria-label="Close link dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {!toolbar?.hasSelection && (
                <label className="mb-2 block text-xs font-medium text-[#6e6f67]">
                  Link text
                  <input
                    value={linkText}
                    onChange={(event) => setLinkText(event.target.value)}
                    placeholder="Read the full story"
                    className="mt-1 w-full rounded-md border border-[#e2dfd6] bg-white px-2.5 py-2 text-sm text-[#26271f] outline-none focus:border-[#292a25]"
                  />
                </label>
              )}
              <label className="mb-2 block text-xs font-medium text-[#6e6f67]">
                Destination
                <input
                  ref={linkInputRef}
                  value={linkUrl}
                  onChange={(event) => {
                    setLinkUrl(event.target.value);
                    setDialogError('');
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      applyLink();
                    }
                  }}
                  placeholder="https://example.com or /about"
                  className="mt-1 w-full rounded-md border border-[#e2dfd6] bg-white px-2.5 py-2 text-sm text-[#26271f] outline-none focus:border-[#292a25]"
                />
              </label>
              <label className="mb-2 flex items-center gap-2 text-xs text-[#5f6058]">
                <input
                  type="checkbox"
                  checked={linkNewTab}
                  onChange={(event) => setLinkNewTab(event.target.checked)}
                  className="h-3.5 w-3.5 rounded border-[#cfcbc0]"
                />
                Open in a new tab
              </label>
              {dialogError && <p className="mb-2 text-xs text-[#a33a2b]">{dialogError}</p>}
              <div className="mt-3 flex items-center justify-between gap-2">
                {toolbar?.isLink ? (
                  <button
                    type="button"
                    onClick={removeLink}
                    className="text-xs font-medium text-[#a33a2b] hover:underline"
                  >
                    Remove link
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLinkOpen(false)}
                    className="rounded-md px-3 py-1.5 text-xs font-medium text-[#6e6f67] hover:bg-[#f1efe8]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={applyLink}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#292a25] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#42433c]"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {imageOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-[#1b1c17]/45 backdrop-blur-[2px]"
              aria-label="Close image dialog"
              onClick={() => setImageOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Insert image"
              className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-xl border border-[#ddd9cf] bg-[#fffefb] p-4 shadow-[0_24px_70px_rgba(38,37,31,0.24)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-[#26271f]">Insert image</p>
                <button
                  type="button"
                  onClick={() => setImageOpen(false)}
                  className="rounded p-1 text-[#8b8c83] hover:bg-[#f1efe8] hover:text-[#26271f]"
                  aria-label="Close image dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {onUploadImage && (
                <div className="mb-3 flex rounded-lg bg-[#f2f0e9] p-1 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setImageTab('upload')}
                    className={`flex-1 rounded-md px-2 py-1.5 ${imageTab === 'upload' ? 'bg-white text-[#26271f] shadow-sm' : 'text-[#77786f]'}`}
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageTab('url')}
                    className={`flex-1 rounded-md px-2 py-1.5 ${imageTab === 'url' ? 'bg-white text-[#26271f] shadow-sm' : 'text-[#77786f]'}`}
                  >
                    Paste URL
                  </button>
                </div>
              )}

              {imageTab === 'upload' && onUploadImage ? (
                <label className="mb-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[#cfcbc0] bg-[#fbfaf6] px-4 py-6 text-center transition hover:border-[#a8a396] hover:bg-[#f7f5ee]">
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-[#6e6f67]" />
                  ) : (
                    <Upload className="h-5 w-5 text-[#6e6f67]" />
                  )}
                  <span className="text-xs font-medium text-[#4e4f48]">
                    {uploading ? 'Uploading…' : 'Choose an image'}
                  </span>
                  <span className="text-[11px] text-[#8b8c83]">JPG, PNG, WebP or GIF · up to 10 MB</span>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={uploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handleImageFile(file);
                      event.target.value = '';
                    }}
                  />
                </label>
              ) : (
                <label className="mb-2 block text-xs font-medium text-[#6e6f67]">
                  Image URL
                  <input
                    ref={imageUrlInputRef}
                    value={imageUrl}
                    onChange={(event) => {
                      setImageUrl(event.target.value);
                      setDialogError('');
                    }}
                    placeholder="https://images.example.com/photo.jpg"
                    className="mt-1 w-full rounded-md border border-[#e2dfd6] bg-white px-2.5 py-2 text-sm text-[#26271f] outline-none focus:border-[#292a25]"
                  />
                </label>
              )}

              <label className="mb-2 block text-xs font-medium text-[#6e6f67]">
                Alt text <span className="font-normal text-[#9a9b92]">— describe the image for screen readers</span>
                <input
                  value={imageAlt}
                  onChange={(event) => setImageAlt(event.target.value)}
                  placeholder="A barista pouring latte art"
                  className="mt-1 w-full rounded-md border border-[#e2dfd6] bg-white px-2.5 py-2 text-sm text-[#26271f] outline-none focus:border-[#292a25]"
                />
              </label>

              {imageUrl && (
                <div className="mb-2 overflow-hidden rounded-md border border-[#e8e5dd] bg-[#f7f5ee]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="" className="max-h-40 w-full object-cover" />
                </div>
              )}
              {dialogError && <p className="mb-2 text-xs text-[#a33a2b]">{dialogError}</p>}

              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setImageOpen(false)}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-[#6e6f67] hover:bg-[#f1efe8]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={insertImage}
                  disabled={!imageUrl || uploading}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#292a25] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#42433c] disabled:opacity-40"
                >
                  <Check className="h-3.5 w-3.5" />
                  Insert
                </button>
              </div>
            </div>
          </div>
        )}

        {editor && !readOnly && (
          <BubbleMenu
            editor={editor}
            shouldShow={({ state }) => {
              if (state.selection.empty) return false;
              if (editor.isActive('codeBlock')) return false;
              return true;
            }}
            className="flex items-center gap-0.5 rounded-lg border border-[#3a3b35] bg-[#26271f] p-1 text-[#f7f5ee] shadow-[0_10px_30px_rgba(20,21,18,0.25)]"
          >
            <BubbleButton
              label="Bold"
              active={toolbar?.isBold}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-3.5 w-3.5" />
            </BubbleButton>
            <BubbleButton
              label="Italic"
              active={toolbar?.isItalic}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-3.5 w-3.5" />
            </BubbleButton>
            <BubbleButton
              label="Underline"
              active={toolbar?.isUnderline}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <Underline className="h-3.5 w-3.5" />
            </BubbleButton>
            <BubbleButton
              label="Strikethrough"
              active={toolbar?.isStrike}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="h-3.5 w-3.5" />
            </BubbleButton>
            <BubbleButton
              label="Link"
              active={toolbar?.isLink}
              onClick={openLinkDialog}
            >
              <Link2 className="h-3.5 w-3.5" />
            </BubbleButton>
            <BubbleButton
              label="Highlight"
              active={toolbar?.isHighlight}
              onClick={() => editor.chain().focus().toggleHighlight().run()}
            >
              <Highlighter className="h-3.5 w-3.5" />
            </BubbleButton>
          </BubbleMenu>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto bg-[#fffefb] p-10">
          <EditorContent editor={editor} className="h-full" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#ece9e1] bg-[#fdfcf8] px-4 py-2.5 text-[11px] text-[#8b8c83]">
          <span className="flex items-center gap-3">
            <span>{toolbar?.words ?? 0} words</span>
            <span className="h-1 w-1 rounded-full bg-[#c9c5ba]" />
            <span>{toolbar?.characters ?? 0} characters</span>
            <span className="h-1 w-1 rounded-full bg-[#c9c5ba]" />
            <span>~{Math.max(1, Math.ceil((toolbar?.words ?? 0) / 220))} min read</span>
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            <span className="rounded border border-[#e2dfd6] bg-white px-1.5 py-0.5 font-mono text-[10.5px] text-[#77786f]">
              ⌘S
            </span>
            to save
          </span>
        </div>
      </div>
    );
  },
);

function BubbleButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition ${active ? 'bg-[#f7f5ee] text-[#26271f]' : 'text-[#dedbd1] hover:bg-[#3a3b35] hover:text-white'
        }`}
    >
      {children}
    </button>
  );
}
