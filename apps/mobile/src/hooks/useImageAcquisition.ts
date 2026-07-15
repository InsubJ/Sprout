import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";

export interface ImageAcquisitionOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality: number;
  recoverAndroidResult?: boolean;
  onImageUriChange?: (value: string | null) => void;
}
export interface ImageAcquisitionState {
  imageUri: string | null;
  setImageUri: (value: string | null) => void;
  acquire: (source: "camera" | "library") => Promise<string | null>;
  clear: () => void;
}

export function imagePickerRequiresPermission(platform: string): boolean {
  return platform !== "web";
}

export function useImageAcquisition(options: ImageAcquisitionOptions): ImageAcquisitionState {
  const [imageUri, setImageUriState] = useState<string | null>(null);
  const currentUri = useRef<string | null>(null);
  const setImageUri = useCallback(
    (value: string | null): void => {
      const previous = currentUri.current;
      if (previous && previous !== value && previous.startsWith("blob:"))
        URL.revokeObjectURL(previous);
      currentUri.current = value;
      setImageUriState(value);
      options.onImageUriChange?.(value);
    },
    [options.onImageUriChange],
  );
  useEffect(
    () => () => {
      if (currentUri.current?.startsWith("blob:")) URL.revokeObjectURL(currentUri.current);
    },
    [],
  );
  useEffect(() => {
    if (!options.recoverAndroidResult || Platform.OS !== "android") return;
    let active = true;
    void ImagePicker.getPendingResultAsync()
      .then((result) => {
        if (active && result && "canceled" in result && !result.canceled && result.assets[0])
          setImageUri(result.assets[0].uri);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [options.recoverAndroidResult, setImageUri]);
  const acquire = useCallback(
    async (source: "camera" | "library"): Promise<string | null> => {
      const pickerOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ["images"],
        allowsEditing: options.allowsEditing,
        aspect: options.aspect,
        quality: options.quality,
      };
      if (imagePickerRequiresPermission(Platform.OS)) {
        const permission =
          source === "camera"
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted)
          throw new Error(`${source === "camera" ? "Camera" : "Photo"} permission is required`);
      }
      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync(pickerOptions)
          : await ImagePicker.launchImageLibraryAsync(pickerOptions);
      if (result.canceled) return null;
      const uri = result.assets[0]?.uri;
      if (!uri) throw new Error("The selected image is unavailable");
      setImageUri(uri);
      return uri;
    },
    [options.allowsEditing, options.aspect, options.quality, setImageUri],
  );
  return { imageUri, setImageUri, acquire, clear: () => setImageUri(null) };
}
