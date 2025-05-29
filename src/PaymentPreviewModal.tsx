// PaymentPreviewModal.tsx を新規作成
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PaymentPreviewModalProps {
  han: number;
  fu: number;
  isOpen: boolean;
  onConfirm: (isDealer: boolean, isTsumo: boolean) => void;
  onCancel: () => void;
}

export function PaymentPreviewModal({ han, fu, isOpen, onConfirm, onCancel }: PaymentPreviewModalProps) {
  // 点数計算
  const ronDealer = calculateRonScore(han, fu, true);
  const ronNonDealer = calculateRonScore(han, fu, false);
  const tsumoPayments = calculateTsumoScore(han, fu, false);
  const tsumoDealerPayments = calculateTsumoScore(han, fu, true);

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">支払い一覧</DialogTitle>
          <div className="text-center text-sm text-gray-500">
            {han}翻{fu}符
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* ロン支払い */}
          <div className="space-y-2">
            <h3 className="font-bold border-b pb-1">ロン</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-sm text-gray-500">親のロン</div>
                <div className="text-xl font-bold text-blue-700">{ronDealer.toLocaleString()}点</div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="text-sm text-gray-500">子のロン</div>
                <div className="text-xl font-bold text-green-700">{ronNonDealer.toLocaleString()}点</div>
              </div>
            </div>
          </div>

          {/* ツモ支払い */}
          <div className="space-y-2">
            <h3 className="font-bold border-b pb-1">ツモ</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-sm text-gray-500">親がアガリ</div>
                <div className="text-lg text-blue-700">
                  全員 {tsumoDealerPayments.fromNonDealer.toLocaleString()}点
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="text-sm text-gray-500">子がアガリ</div>
                <div className="space-y-1">
                  <div className="text-sm text-green-700">
                    親: {tsumoPayments.fromDealer.toLocaleString()}点
                  </div>
                  <div className="text-sm text-green-700">
                    子: {tsumoPayments.fromNonDealer.toLocaleString()}点
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-col gap-2 pt-4">
            <Button 
              onClick={() => onConfirm(true, false)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              親のロンを適用
            </Button>
            <Button 
              onClick={() => onConfirm(false, false)}
              className="bg-green-600 hover:bg-green-700"
            >
              子のロンを適用
            </Button>
            <Button 
              onClick={() => onConfirm(false, true)}
              variant="outline"
              className="border-blue-500 text-blue-600"
            >
              子のツモを適用
            </Button>
            <Button 
              onClick={() => onConfirm(true, true)}
              variant="outline"
              className="border-blue-500 text-blue-600"
            >
              親のツモを適用
            </Button>
            <Button 
              onClick={onCancel}
              variant="ghost"
              className="text-gray-500"
            >
              キャンセル
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}