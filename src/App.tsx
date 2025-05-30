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
  reachSticks: number;
  toggleDealer: (index: number) => void;
  toggleReach: (index: number) => void;
  addScore: (index: number, amount: number) => void;
  resetGame: () => void;
  moveDealer: () => void;
  setPlayerReach: (index: number, isReach: boolean) => void;
}

const useMahjongStore = create<MahjongState>((set) => ({
  players: [
    { name: "東", score: 25000, isDealer: true, isReach: false },
    { name: "南", score: 25000, isDealer: false, isReach: false },
    { name: "西", score: 25000, isDealer: false, isReach: false },
    { name: "北", score: 25000, isDealer: false, isReach: false },
  ],
  round: "東1局",
  reachSticks: 0,
  toggleDealer: (index) =>
    set((state) => ({
      players: state.players.map((p, i) => ({ ...p, isDealer: i === index })),
    })),
// toggleReach 関数の修正
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
        return { 
          players,
          reachSticks: state.reachSticks + 1
        };
      } else {
        // リーチ解除時の処理
        player.score += 1000;
        player.isReach = false;
        return {
          players,
          reachSticks: Math.max(0, state.reachSticks - 1) // リーチ棒を1本減らす
        };
      }
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
      reachSticks: 0,
    }),
  moveDealer: () =>
    set((state) => {
      const currentDealerIndex = state.players.findIndex(p => p.isDealer);
      const nextDealerIndex = (currentDealerIndex + 1) % 4;
      const currentRoundNumber = parseInt(state.round.slice(1)) || 1;
      
      let nextRound;
      switch(nextDealerIndex) {
        case 0:
          nextRound = `東${currentRoundNumber + 1}局`;
          break;
        case 1:
          nextRound = `南${currentRoundNumber}局`;
          break;
        case 2:
          nextRound = `西${currentRoundNumber}局`;
          break;
        default:
          nextRound = `北${currentRoundNumber}局`;
      }

      return {
        players: state.players.map((p, i) => ({
          ...p,
          isDealer: i === nextDealerIndex,
          isReach: false,
        })),
        round: nextRound,
      };
    }),
  setPlayerReach: (index, isReach) =>
    set((state) => {
      const players = [...state.players];
      players[index].isReach = isReach;
      return { players };
    }),
}));

function calculateRonScore(han: number, fu: number, isDealer: boolean): number {
  if (han >= 13) return 32000;
  if (han >= 11) return 24000;
  if (han >= 8) return 16000;
  if (han >= 6) return 12000;
  if (han >= 5 || (han === 4 && fu >= 40) || (han === 3 && fu >= 70)) return 8000;

  const basePoints = fu * Math.pow(2, 2 + han);
  const total = basePoints * (isDealer ? 6 : 4);
  return Math.ceil(total / 100) * 100;
}

function calculateTsumoScore(han: number, fu: number, isDealer: boolean) {
  if (han >= 13) return { fromDealer: 16000, fromNonDealer: 8000 };
  if (han >= 11) return { fromDealer: 12000, fromNonDealer: 6000 };
  if (han >= 8) return { fromDealer: 8000, fromNonDealer: 4000 };
  if (han >= 6) return { fromDealer: 6000, fromNonDealer: 3000 };
  if (han >= 5 || (han === 4 && fu >= 40) || (han === 3 && fu >= 70))
    return { fromDealer: 4000, fromNonDealer: 2000 };

  const basePoints = fu * Math.pow(2, 2 + han);

  if (isDealer) {
    const payment = Math.ceil((basePoints * 2) / 100) * 100;
    return { fromDealer: payment, fromNonDealer: payment };
  } else {
    const fromDealer = Math.ceil((basePoints * 2) / 100) * 100;
    const fromNonDealer = Math.ceil(basePoints / 100) * 100;
    return { fromDealer, fromNonDealer };
  }
}

interface PaymentPreviewModalProps {
  han: number;
  fu: number;
  isOpen: boolean;
  onConfirm: (isDealer: boolean, isTsumo: boolean) => void;
  onCancel: () => void;
  agariType: "ron" | "tsumo";
  reachSticks: number;
}

function PaymentPreviewModal({ han, fu, isOpen, onConfirm, onCancel, agariType, reachSticks }: PaymentPreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">支払い一覧</DialogTitle>
          <div className="text-center text-sm text-gray-500">
            {han}翻{fu}符 ({agariType === "ron" ? "ロン" : "ツモ"})
            {reachSticks > 0 && (
              <div className="mt-1 text-red-600">
                リーチ棒: {reachSticks}本 (+{reachSticks * 1000}点)
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {agariType === "ron" ? (
            <div className="space-y-2">
              <h3 className="font-bold border-b pb-1">ロン</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-sm text-gray-500">親のロン</div>
                  <div className="text-xl font-bold text-blue-700">
                    {calculateRonScore(han, fu, true).toLocaleString()}点
                    {reachSticks > 0 && (
                      <span className="text-sm text-red-600"> + {reachSticks * 1000}点</span>
                    )}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-sm text-gray-500">子のロン</div>
                  <div className="text-xl font-bold text-green-700">
                    {calculateRonScore(han, fu, false).toLocaleString()}点
                    {reachSticks > 0 && (
                      <span className="text-sm text-red-600"> + {reachSticks * 1000}点</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="font-bold border-b pb-1">ツモ</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-sm text-gray-500">親がアガリ</div>
                  <div className="text-lg text-blue-700">
                    全員 {calculateTsumoScore(han, fu, true).fromNonDealer.toLocaleString()}点
                    {reachSticks > 0 && (
                      <div className="text-sm text-red-600">リーチ棒: +{reachSticks * 1000}点</div>
                    )}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-sm text-gray-500">子がアガリ</div>
                  <div className="space-y-1">
                    <div className="text-sm text-green-700">
                      親: {calculateTsumoScore(han, fu, false).fromDealer.toLocaleString()}点
                    </div>
                    <div className="text-sm text-green-700">
                      子: {calculateTsumoScore(han, fu, false).fromNonDealer.toLocaleString()}点
                    </div>
                    {reachSticks > 0 && (
                      <div className="text-sm text-red-600">リーチ棒: +{reachSticks * 1000}点</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-4">
            {agariType === "ron" ? (
              <>
                <Button onClick={() => onConfirm(true, false)} className="bg-blue-600 hover:bg-blue-700">
                  親のロンを適用
                </Button>
                <Button onClick={() => onConfirm(false, false)} className="bg-green-600 hover:bg-green-700">
                  子のロンを適用
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => onConfirm(true, true)} className="bg-blue-600 hover:bg-blue-700">
                  親のツモを適用
                </Button>
                <Button onClick={() => onConfirm(false, true)} className="bg-green-600 hover:bg-green-700">
                  子のツモを適用
                </Button>
              </>
            )}
            <Button onClick={onCancel} variant="ghost" className="text-gray-500">
              キャンセル
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MahjongScoreboard() {
  const {
    players,
    round,
    reachSticks,
    toggleReach,
    addScore,
    resetGame,
    moveDealer,
    setPlayerReach,
  } = useMahjongStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [reachResetIndex, setReachResetIndex] = useState<number | null>(null);
  const [agariPlayerIndex, setAgariPlayerIndex] = useState<number | null>(null);
  const [ronPlayerIndex, setRonPlayerIndex] = useState<number | null>(null);
  const [han, setHan] = useState("1");
  const [fu, setFu] = useState("30");
  const [agariType, setAgariType] = useState<"ron" | "tsumo">("ron");

  const handleAgariClick = (index: number) => {
    setAgariPlayerIndex(index);
    setRonPlayerIndex(null);
    setDialogOpen(true);
  };

  const handleReachClick = (index: number) => {
    if (players[index].isReach) {
      setReachResetIndex(index);
    } else {
      if (players[index].score >= 1000) {
        toggleReach(index);
      } else {
        alert("リーチするには1000点以上必要です！");
      }
    }
  };

  const handleSubmitAgari = () => {
    if (agariPlayerIndex === null) {
      alert("アガリプレイヤーが選択されていません");
      return;
    }

    const hanNum = parseInt(han);
    const fuNum = parseInt(fu);
    
    if (isNaN(hanNum) || isNaN(fuNum) || hanNum <= 0 || fuNum <= 0) {
      alert("有効な翻数と符数を入力してください");
      return;
    }
    
    if (agariType === "ron" && ronPlayerIndex === null) {
      alert("ロンの場合、放銃者を選択してください");
      return;
    }
    
    setPreviewOpen(true);
  };

  const handleApplyPayment = (isDealer: boolean, isTsumo: boolean) => {
    try {
      const hanNum = parseInt(han);
      const fuNum = parseInt(fu);
      const { reachSticks } = useMahjongStore.getState();
      
      if (isTsumo || agariType === "tsumo") {
        const { fromDealer, fromNonDealer } = calculateTsumoScore(hanNum, fuNum, isDealer);
        let totalGain = reachSticks * 1000; // リーチ棒を加算
        
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
      } else {
        if (ronPlayerIndex === null) throw new Error("放銃者未選択");
        const point = calculateRonScore(hanNum, fuNum, isDealer);
        addScore(agariPlayerIndex!, point + reachSticks * 1000); // リーチ棒を加算
        addScore(ronPlayerIndex, -point);
      }
      
      // リーチ棒をリセット
      set((state) => ({
        ...state,
        reachSticks: 0,
        players: state.players.map(p => ({ ...p, isReach: false }))
      }));
      
      setPreviewOpen(false);
      setDialogOpen(false);
    } catch (error) {
      console.error("点数計算エラー:", error);
      alert("点数計算中にエラーが発生しました");
    }
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
        <div className="text-sm text-gray-700">
          リーチ棒: {reachSticks}本 ({(reachSticks * 1000).toLocaleString()}点)
        </div>
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
              <div className={`text-xl ${player.name === "東" ? "text-red-600 font-bold" : ""} ${player.isDealer ? "font-bold" : ""}`}>
                {player.name}{player.isDealer ? "（親）" : ""}
              </div>
              <div className="text-2xl">{player.score.toLocaleString()} 点</div>
              <Button
                variant={player.isReach ? "default" : "outline"}
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
            <label className="block text-sm font-medium">和了方法</label>
            <Select 
              value={agariType}
              onValueChange={(v) => setAgariType(v as "ron" | "tsumo")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="和了方法を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ron">ロン</SelectItem>
                <SelectItem value="tsumo">ツモ</SelectItem>
              </SelectContent>
            </Select>
          </div>

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

          {agariType === "ron" && (
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
          )}

          <Button 
            onClick={(e) => {
              e.preventDefault();
              handleSubmitAgari();
            }}
            className="w-full"
          >
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
        onCancel={() => {
          setPreviewOpen(false);
          setDialogOpen(false);
        }}
        agariType={agariType}
        reachSticks={reachSticks}
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
      <Dialog open={reachResetIndex !== null} onOpenChange={(open) => {
        if (!open) setReachResetIndex(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>リーチを解除しますか？</DialogTitle>
            <DialogDescription>
              1000点が返金され、場のリーチ棒が1本減ります
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReachResetIndex(null)}>
              キャンセル
            </Button>
            <Button variant="default" onClick={() => {
              if (reachResetIndex !== null) {
                toggleReach(reachResetIndex); // toggleReachを使用するように変更
                setReachResetIndex(null);
              }
            }}>
              解除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}