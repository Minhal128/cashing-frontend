"use client";

import PayoutMethods from "@/components/PayoutMethods";

interface Props {
  open: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

const WithdrawModal = ({ open, onClose, onRefresh }: Props) => {
  if (!open) return null;

  const handleClose = () => {
    onRefresh?.();
    window.dispatchEvent(new CustomEvent('refresh-balances'));
    onClose();
  };

  return <PayoutMethods onClose={handleClose} />;
};

export default WithdrawModal;
