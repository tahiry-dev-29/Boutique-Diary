"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload, X, Link, Loader2 } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import Image from "next/image";
import { toast } from "sonner";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string | null) => void;
  onRemove?: () => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  showUrlInput?: boolean;
  aspectRatio?: "square" | "video" | "auto";
}

export function ImageUploader({
  value,
  onChange,
  onRemove,
  accept = "image/*",
  maxSize = 5,
  className,
  showUrlInput = false,
  aspectRatio = "auto",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [showUrlField, setShowUrlField] = React.useState(false);
  const [urlInput, setUrlInput] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "",
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Le fichier doit faire moins de ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'upload");
      }

      const data = await response.json();
      onChange(data.url);
      toast.success("Image uploadée avec succès");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erreur lors de l'upload de l'image");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;

    setIsUploading(true);

    try {
      const response = await fetch("/api/upload-url-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement");
      }

      const data = await response.json();
      onChange(data.path);
      setUrlInput("");
      setShowUrlField(false);
      toast.success("Image ajoutée avec succès");
    } catch (error) {
      console.error("URL download error:", error);
      toast.error("Erreur lors du téléchargement de l'image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
    onRemove?.();
  };

  if (value) {
    return (
      <div
        className={cn("relative group", aspectClasses[aspectRatio], className)}
      >
        <Image
          src={value}
          alt="Preview"
          fill
          className="object-cover rounded-lg"
        />
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn(
          "border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center",
          "hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer",
          aspectClasses[aspectRatio],
        )}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Upload en cours...
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Cliquez pour uploader une image
            </p>
            <p className="text-xs text-muted-foreground/75">Max {maxSize}MB</p>
          </div>
        )}
      </div>

      {showUrlInput && (
        <>
          {!showUrlField ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowUrlField(true)}
              className="w-full"
            >
              <Link className="h-4 w-4 mr-2" />
              Ajouter via URL
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={isUploading}
              />
              <Button
                type="button"
                size="sm"
                onClick={handleUrlSubmit}
                disabled={isUploading || !urlInput.trim()}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Ajouter"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowUrlField(false);
                  setUrlInput("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
