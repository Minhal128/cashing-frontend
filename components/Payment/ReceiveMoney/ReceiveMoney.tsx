import DepositCrypto from "./DepositCrypto";
import OtherPaymentMethod from "./OtherPaymentMethod";
import QRCode from "./QRCode";
import RecentTransaction from "./RecentTransaction";

export default function ReceiveMoney() {
  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 auto-rows-min">
          <div className="flex flex-col gap-4">
            <div className="h-fit">
              <QRCode />
            </div>

            <div className="h-fit">
              <RecentTransaction />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="h-fit">
              <DepositCrypto />
            </div>

            <div className="h-fit">
              <OtherPaymentMethod />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
