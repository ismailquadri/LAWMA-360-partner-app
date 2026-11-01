// The preview only uses React DOM's portal API; native builds use sheet-overlay.tsx.
declare module 'react-dom' {
  export function createPortal(children: import('react').ReactNode, container: Element | DocumentFragment, key?: string | null): import('react').ReactPortal;
}
