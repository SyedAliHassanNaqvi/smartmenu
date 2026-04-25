// Global type declarations for A-Frame
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': {
        embedded?: boolean;
        [key: string]: any;
      };
      'a-assets': {
        [key: string]: any;
      };
      'a-asset-item': {
        id?: string;
        src?: string;
        [key: string]: any;
      };
      'a-entity': {
        'gltf-model'?: string;
        position?: string;
        rotation?: string;
        scale?: string;
        [key: string]: any;
      };
      'a-light': {
        type?: string;
        position?: string;
        intensity?: string | number;
        [key: string]: any;
      };
      'a-camera': {
        position?: string;
        [key: string]: any;
      };
    }
  }
}

export {};
