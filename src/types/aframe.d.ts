// A-Frame custom element type definitions
declare namespace JSX {
  interface IntrinsicElements {
    "a-scene": AFrameSceneProps;
    "a-assets": Record<string, any>;
    "a-asset-item": AFrameAssetProps;
    "a-entity": AFrameEntityProps;
    "a-box": AFrameBoxProps;
    "a-camera": AFrameCameraProps;
    "a-light": AFrameLightProps;
  }

  interface AFrameSceneProps {
    embedded?: boolean;
    children?: React.ReactNode;
    [key: string]: any;
  }

  interface AFrameAssetProps {
    id: string;
    src: string;
    [key: string]: any;
  }

  interface AFrameEntityProps {
    "gltf-model"?: string;
    position?: string;
    rotation?: string;
    scale?: string;
    children?: React.ReactNode;
    [key: string]: any;
  }

  interface AFrameBoxProps {
    position?: string;
    rotation?: string;
    scale?: string;
    color?: string;
    [key: string]: any;
  }

  interface AFrameCameraProps {
    position?: string;
    [key: string]: any;
  }

  interface AFrameLightProps {
    type?: string;
    position?: string;
    intensity?: number;
    [key: string]: any;
  }
}
