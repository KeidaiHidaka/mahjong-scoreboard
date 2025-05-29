import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { create } from "zustand";

interface Player {
  name: string;
  score: number;
  isDealer: boolean;
  isReach: boolean;
}

interface MahjongState {
  players: Player[];
  round: string;
  toggleDealer: (index: number) => void;
  toggleReach: (index: number) => void;
  addScore: (index: number, amount: number) => void;
  resetGame: () => void;
  moveDealer: () => void;
}

const useMahjongStore = create<MahjongState>((set) => ({
  players: [
    { name: "東", score: 25000, isDealer: true, isReach: false },
    { name: "南", score: 25000, isDealer: false, isReach: false },
    { name: "西", score: 25000, isDealer: false, isReach: false },
    { name: "北", score: 25000, isDealer: false, isReach: false },
  ],
  round: "東1局",
  toggleDealer: (index) =>
    set((state) => ({
      players: state.players.map((p, i) => ({ ...p, isDealer: i === index })),
    })),
  toggleReach: (index) =>
    set((state) => {
      const players = [...state.players];
      const player = players[index];

      if (!player.isReach) {
        if (player.score < 1000) {
          alert("リーチするには1000点以上必要です！");
          return state;
        }
        player.score -= 1000;
        player.isReach = true;
        return { players };
      }
      return state;
    }),
  addScore: (index, amount) =>
    set((state) => {
      const players = [...state.players];
      players[index].score += amount;
      return { players };
    }),
  resetGame: () =>
    set({
      players: [
        { name: "東", score: 25000, isDealer: true, isReach: false },
        { name: "南", score: 25000, isDealer: false, isReach: false },
        { name: "西", score: 25000, isDealer: false, isReach: false },
        { name: "北", score: 25000, isDealer: false, isReach: false },
      ],
      round: "東1局",
    }),
  moveDealer: () =>
    set((state) => {
      const currentDealerIndex = state.players.findIndex(p => p.isDealer);
      const nextDealerIndex = (currentDealerIndex + 1) % 4;
      const nextRound = 
        nextDealerIndex === 0 ? "東" + (parseInt(state.round.slice(1))) + 1 + "局" :
        nextDealerIndex === 1 ? "南" + state.round.slice(1) + "局" :
        nextDealerIndex === 2 ? "西" + state.round.slice(1) + "局" :
        "北" + state.round.slice(1) + "局";
      
      return {
        players: state.players.map((p, i) => ({
          ...p,
          isDealer: i === nextDealerIndex,
          isReach: false,
        })),
        round: nextRound,
      };
    }),
}));

// ...（calculateRonScoreとcalculateTsumoScore関数は同じなので省略）...

interface PaymentPreviewModalProps {
  han: number;
  fu: number;
  isOpen: boolean;
  onConfirm: (isDealer: boolean, isTsumo: boolean) => void;
  onCancel: () => void;
}

function PaymentPreviewModal({ han, fu, isOpen, onConfirm, onCancel }: PaymentPreviewModalProps) {
  // ...（PaymentPreviewModalの実装は同じなので省略）...
}

export default function MahjongScoreboard() {
  const {
    players,
    round,
    toggleDealer,
    toggleReach,
    addScore,
    resetGame,
    moveDealer,
  } = useMahjongStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [reachResetIndex, setReachResetIndex] = useState<number | null>(null);
  const [agariPlayerIndex, setAgariPlayerIndex] = useState<number | null>(null);
  const [ronPlayerIndex, setRonPlayerIndex] = useState<number | null>(null);
  const [han, setHan] = useState("1");
  const [fu, setFu] = useState("30");

  const handleAgariClick = (index: number) => {
    setAgariPlayerIndex(index);
    setRonPlayerIndex(null);
    setDialogOpen(true);
  };

  const handleReachClick = (index: number) => {
    if (players[index].isReach) {
      setReachResetIndex(index);
    } else {
      toggleReach(index);
    }
  };

  const resetReach = () => {
    if (reachResetIndex !== null) {
      addScore(reachResetIndex, 1000);
      toggleReach(reachResetIndex);
      setReachResetIndex(null);
    }
  };

  const handleSubmitAgari = () => {
    const hanNum = parseInt(han);
    const fuNum = parseInt(fu);
    
    if (hanNum <= 0 || fuNum <= 0) {
      alert("翻数と符数を正しく入力してください");
      return;
    }
    
    setPreviewOpen(true);
  };

  const handleApplyPayment = (isDealer: boolean, isTsumo: boolean) => {
    setPreviewOpen(false);
    setDialogOpen(false);
    
    if (isTsumo) {
      handleTsumo(isDealer);
    } else {
      if (ronPlayerIndex === null) {
        alert("放銃者を選択してください");
        return;
      }
      const hanNum = parseInt(han);
      const fuNum = parseInt(fu);
      const point = calculateRonScore(hanNum, fuNum, isDealer);
      addScore(agariPlayerIndex!, point);
      addScore(ronPlayerIndex, -point);
    }
  };

  const handleTsumo = (isDealer: boolean) => {
    const hanNum = parseInt(han);
    const fuNum = parseInt(fu);
    const { fromDealer, fromNonDealer } = calculateTsumoScore(hanNum, fuNum, isDealer);

    let totalGain = 0;
    players.forEach((p, i) => {
      if (i === agariPlayerIndex) return;
      if (p.isDealer) {
        addScore(i, -fromDealer);
        totalGain += fromDealer;
      } else {
        addScore(i, -fromNonDealer);
        totalGain += fromNonDealer;
      }
    });

    addScore(agariPlayerIndex!, totalGain);
  };

  return (
    <div className="w-screen h-screen bg-green-800 text-black grid grid-rows-3 gap-2 p-2">
      {/* 上半分: プレイヤー1,2（反転表示） */}
      <div className="grid grid-cols-2 transform rotate-180">
          {players.slice(0, 2).map((player, index) => (
            <Card key={index} className="flex flex-col items-center justify-center p-4 text-center space-y-2">
              <CardContent className="flex flex-col items-center space-y-2">
                <div className={`text-xl ${player.name === "東" ? "text-red-600 font-bold" : ""} ${player.isDealer ? "font-bold" : ""}`}>
                  {player.name}{player.isDealer ? "（親）" : ""}
                </div>
                <div className="text-2xl">{player.score.toLocaleString()} 点</div>
              <Button
                variant={player.isReach ? "default" : "outline"}
                disabled={player.isReach || player.score < 1000}
                onClick={() => handleReachClick(index)}
              >
                {player.isReach ? "リーチ済み" : "リーチ（-1000）"}
              </Button>
              <Button variant="default" onClick={() => handleAgariClick(index)}>
                アガり
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 中央部: 場情報と操作ボタン */}
      <div className="flex flex-col items-center justify-center text-center space-y-4 bg-white rounded-xl p-4 shadow-xl">
        <div className="text-xl font-semibold">{round}</div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={moveDealer}>
            親移動
          </Button>
          <Button variant="destructive" onClick={() => setResetConfirmOpen(true)}>
            ゲームリセット
          </Button>
        </div>
      </div>

      {/* 下半分: プレイヤー3,4（通常表示） */}
      <div className="grid grid-cols-2">
        {players.slice(2, 4).map((player, index) => (
          <Card key={index + 2} className="flex flex-col items-center justify-center p-4 text-center space-y-2">
            <CardContent className="flex flex-col items-center space-y-2">
              <div className={`text-xl font-bold ${player.name === "東" ? "text-red-600" : ""}`}>
                {player.name}
              </div>
              <div className="text-2xl">{player.score.toLocaleString()} 点</div>
              <Button
                variant={player.isReach ? "default" : "outline"}
                disabled={player.isReach || player.score < 1000}
                onClick={() => handleReachClick(index + 2)}
              >
                {player.isReach ? "リーチ済み" : "リーチ（-1000）"}
              </Button>
              <Button variant="default" onClick={() => handleAgariClick(index + 2)}>
                アガり
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 和了入力ダイアログ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="space-y-4">
          <DialogHeader>
            <DialogTitle>アガり入力</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <label className="block text-sm font-medium">翻数</label>
            <Select value={han} onValueChange={setHan}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="翻数を選択" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(13)].map((_, i) => (
                  <SelectItem key={i} value={(i + 1).toString()}>
                    {i + 1}翻
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">符数</label>
            <Select value={fu} onValueChange={setFu}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="符数を選択" />
              </SelectTrigger>
              <SelectContent>
                {[20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110].map((f) => (
                  <SelectItem key={f} value={f.toString()}>
                    {f}符
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">放銃者</label>
            <Select 
              value={ronPlayerIndex?.toString() ?? ""} 
              onValueChange={(v) => setRonPlayerIndex(parseInt(v))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="放銃者を選択" />
              </SelectTrigger>
              <SelectContent>
                {players.map((p, i) => (
                  i !== agariPlayerIndex && (
                    <SelectItem key={i} value={i.toString()}>
                      {p.name}
                    </SelectItem>
                  )
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSubmitAgari} className="w-full">
            支払いを確認
          </Button>
          
          <Button variant="secondary" onClick={() => setDialogOpen(false)} className="w-full">
            キャンセル
          </Button>
        </DialogContent>
      </Dialog>

      {/* 支払い確認モーダル */}
      <PaymentPreviewModal
        han={parseInt(han)}
        fu={parseInt(fu)}
        isOpen={previewOpen}
        onConfirm={handleApplyPayment}
        onCancel={() => setPreviewOpen(false)}
      />

      {/* リセット確認モーダル */}
      <Dialog open={resetConfirmOpen} onOpenChange={setResetConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>本当にリセットしますか？</DialogTitle>
            <DialogDescription>
              すべての点数が初期値に戻り、東1局から再開します
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetConfirmOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={() => {
              resetGame();
              setResetConfirmOpen(false);
            }}>
              リセット
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* リーチ解除確認モーダル */}
      <Dialog open={reachResetIndex !== null} onOpenChange={() => setReachResetIndex(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>リーチを解除しますか？</DialogTitle>
            <DialogDescription>
              リーチ棒は返還されませんが、1000点が返金されます
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReachResetIndex(null)}>
              キャンセル
            </Button>
            <Button variant="default" onClick={() => {
              resetReach();
              setReachResetIndex(null);
            }}>
              解除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}