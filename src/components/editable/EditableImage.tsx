import { useRef, useState } from "react";
import { useEditMode } from "@/hooks/useEditMode";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Sliders } from "lucide-react";
import { toast } from "sonner";
import ImageStylePopover, { ImageStyle } from "./ImageStylePopover";

interface EditableImageProps {
  contentKey: string;
  defaultSrc: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
}

const EditableImage = ({
  contentKey,
  defaultSrc,
  alt = "",
  className = "",
  imgClassName = "",
}: EditableImageProps) => {
  const { editMode, getImageOverride, getStyleOverride, saveOverride } = useEditMode();
  const fileRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<{ x: number; y: number } | null>(null);

  const displaySrc = getImageOverride(contentKey) || defaultSrc;
  const imgStyle = getStyleOverride(contentKey) as ImageStyle;

  const wrapperJustify =
    imgStyle.align === "center" ? "justify-center" :
    imgStyle.align === "right" ? "justify-end" : "justify-start";

  const styleObject: React.CSSProperties = {
    ...(imgStyle.width ? { width: `${imgStyle.width}%` } : {}),
    transform: `translate(${imgStyle.offsetX ?? 0}px, ${imgStyle.offsetY ?? 0}px) rotate(${imgStyle.rotation ?? 0}deg)`,
    opacity: imgStyle.opacity ?? 1,
    ...(imgStyle.objectFit ? { objectFit: imgStyle.objectFit } : {}),
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const ext = file.name.split(".").pop();
      const path = `overrides/${contentKey.replace(/\./g, "-")}-${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("hero-images")
        .upload(path, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from("hero-images")
        .getPublicUrl(path);
      saveOverride({ key: contentKey, value: alt, type: "image", imageUrl: urlData.publicUrl });
      toast.success("Image replaced");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = () => {
    saveOverride({ key: contentKey, imageUrl: "" });
    toast.success("Image reset to default");
  };

  if (!editMode) {
    return (
      <div className={`flex ${wrapperJustify} ${className}`}>
        <img src={displaySrc} alt={alt} className={imgClassName} style={styleObject} />
      </div>
    );
  }

  const openPopover = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = triggerRef.current?.getBoundingClientRect();
    setPopoverAnchor({ x: (rect?.right ?? e.clientX) + 8, y: (rect?.top ?? e.clientY) });
  };

  return (
    <div className={`relative group/img flex ${wrapperJustify} ${className}`}>
      <img src={displaySrc} alt={alt} className={imgClassName} style={styleObject} />
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

      <div className="absolute top-2 right-2 flex gap-1 z-40">
        <button
          ref={triggerRef}
          onClick={openPopover}
          className="bg-card border border-border text-foreground rounded-full p-2 shadow-lg md:opacity-0 md:group-hover/img:opacity-100 transition-opacity"
          title="Image style"
        >
          <Sliders size={13} />
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg md:opacity-0 md:group-hover/img:opacity-100 transition-opacity"
          title="Replace image"
        >
          <Upload size={13} />
        </button>
      </div>

      {popoverAnchor && (
        <ImageStylePopover
          anchor={popoverAnchor}
          initial={imgStyle}
          onChange={(s) => saveOverride({ key: contentKey, styleJson: s })}
          onUpload={() => fileRef.current?.click()}
          onRemove={removeImage}
          onReset={() => saveOverride({ key: contentKey, styleJson: {} })}
          onClose={() => setPopoverAnchor(null)}
        />
      )}
    </div>
  );
};

export default EditableImage;
