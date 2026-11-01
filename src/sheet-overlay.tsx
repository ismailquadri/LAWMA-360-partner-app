import React from 'react';
import { Modal } from 'react-native';
export function SheetHost({ children }: { children: React.ReactNode }) { return <>{children}</>; }
export function SheetOverlay({ visible, onClose, reduced, children }: { visible: boolean; onClose: () => void; reduced: boolean; title: string; children: React.ReactNode }) {
  return <Modal visible={visible} transparent animationType={reduced ? 'none' : 'slide'} onRequestClose={onClose}>{children}</Modal>;
}
