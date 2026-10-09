import type * as React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "a-scene": AFrameSceneProps;
      "a-assets": Record<string, unknown>;
      "a-asset-item": AFrameAssetProps;
      "a-entity": AFrameEntityProps;
      "a-light": AFrameLightProps;
    }
  }
}

interface AFrameSceneProps {
  embedded?: boolean;
  children?: React.ReactNode;
  [key: string]: unknown;
}

interface AFrameAssetProps {
  id: string;
  src: string;
  [key: string]: unknown;
}

interface AFrameEntityProps {
  "gltf-model"?: string;
  position?: string;
  rotation?: string;
  scale?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

interface AFrameLightProps {
  type?: string;
  position?: string;
  intensity?: number;
  [key: string]: unknown;
}
