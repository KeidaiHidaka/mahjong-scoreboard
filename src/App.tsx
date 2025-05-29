import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { create } from "zustand";

// Zustand による状態管理
const useMahjongStore = create((set) => ({
  players: [
    { name: "東", score: 25000, isDealer: true, isReach: false },
    { name: "南", score: 25000, isDealer: false, isReach: false },
    { name: "西", score: 25000, isDealer: false, isReach: false },
    { name: "北", score: 25000, isDealer: false, isReach: false },
  ],
  round: "東2局",
  honba: 1,
  dora: "五萬",
  reachSticks: 0,
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
        return { players, reachSticks: state.reachSticks + 1 };
      } else {
        player.score += 1000;
        player.isReach = false;
        return { players, reachSticks: Math.max(0, state.reachSticks - 1) };
      }
    }),
  addScore: (index, amount) =>
    set((state) => {
      const players = [...state.players];
      players[index].score += amount;
      return { players };
    }),
  resetReachSticks: () =>
    set((state) => ({
      reachSticks: 0,
      players: state.players.map((p) => ({ ...p, isReach: false })),
    })),
}));

// 点数計算用の関数
function calculateRonScore(han, fu, isDealer) {
  if (han >= 13) return 32000; // 役満
  if (han >= 11) return 24000; // 三倍満
  if (han >= 8) return 16000; // 倍満
  if (han >= 6) return 12000; // 跳満
  if (han >= 5 || (han === 4 && fu >= 40) || (han === 3 && fu >= 70)) return 8000; // 満貫

  const basePoints = fu * Math.pow(2, 2 + han);
  const total = basePoints * (isDealer ? 6 : 4);
  return Math.ceil(total / 100) * 100;
}

function calculateTsumoScore(han, fu, isDealer) {
  if (han >= 13) return { fromDealer: 16000, fromNonDealer: 16000 };
  if (han >= 11) return { fromDealer: 12000, fromNonDealer: 12000 };
  if (han >= 8) return { fromDealer: 8000, fromNonDealer: 8000 };
  if (han >= 6) return { fromDealer: 6000, fromNonDealer: 6000 };
  if (han >= 5 || (han === 4 && fu >= 40) || (han === 3 && fu >= 70))
    return { fromDealer: 4000, fromNonDealer: 4000 };

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

export default function MahjongScoreboard() {
  const {
    players,
    round,
    honba,
    dora,
    reachSticks,
    toggleDealer,
    toggleReach,
    addScore,
    resetReachSticks,
  } = useMahjongStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [agariPlayerIndex, setAgariPlayerIndex] = useState(null);
  const [ronPlayerIndex, setRonPlayerIndex] = useState(null);
  const [han, setHan] = useState("1");
  const [fu, setFu] = useState("30");

  const handleAgariClick = (index) => {
    setAgariPlayerIndex(index);
    setRonPlayerIndex(null);
    setDialogOpen(true);
  };

  const handleRon = (isDealer) => {
    const hanNum = parseInt(han);
    const fuNum = parseInt(fu);
    const point = calculateRonScore(hanNum, fuNum, isDealer);
    if (ronPlayerIndex === null) {
      alert("放銃者を選択してください");
      return;
    }
    addScore(agariPlayerIndex, point + reachSticks * 1000);
    addScore(ronPlayerIndex, -point);
    resetReachSticks();
    setDialogOpen(false);
  };

  const handleTsumo = (isDealer) => {
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

    addScore(agariPlayerIndex, totalGain + reachSticks * 1000);
    resetReachSticks();
    setDialogOpen(false);
  };

  return (
    <div className="w-screen h-screen bg-green-800 text-black grid grid-rows-3 gap-2 p-2">
      
      {/* 上半分: プレイヤー1,2（反転表示） */}
      <div className="grid grid-cols-2 transform rotate-180">
        {players.slice(0, 2).map((player, index) => (
          <Card key={index} className="flex flex-col items-center justify-center p-4 text-center space-y-2">
            <CardContent className="flex flex-col items-center space-y-2">
              <div className="text-xl font-bold">{player.name}</div>
              <div className="text-2xl">{player.score.toLocaleString()} 点</div>
              <Button
                variant="outline"
                disabled={player.isReach || player.score < 1000}
                onClick={() => toggleReach(index)}
              >
                {player.isReach ? "リーチ済み" : "リーチ（-1000）"}
              </Button>
              <Button variant="default" onClick={() => handleAgariClick(index)}>
                アガり
              </Button>
              <Button variant="ghost" onClick={() => toggleDealer(index)}>
                親にする
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 中央部: 場情報 */}
      <div className="flex flex-col items-center justify-center text-center space-y-2 bg-white rounded-xl p-4 shadow-xl">
        <div className="text-xl font-semibold">{round}</div>
        <div className="text-base">{honba}本場</div>
        <div className="text-red-600 text-lg font-bold">ドラ: {dora}</div>
        <div className="text-sm text-gray-700">リーチ棒: {reachSticks} 本</div>
      </div>

      {/* 下半分: プレイヤー3,4（通常表示） */}
      <div className="grid grid-cols-2">
        {players.slice(2, 4).map((player, index) => (
          <Card key={index + 2} className="flex flex-col items-center justify-center p-4 text-center space-y-2">
            <CardContent className="flex flex-col items-center space-y-2">
              <div className="text-xl font-bold">{player.name}</div>
              <div className="text-2xl">{player.score.toLocaleString()} 点</div>
              <Button
                variant="outline"
                disabled={player.isReach || player.score < 1000}
                onClick={() => toggleReach(index + 2)}
              >
                {player.isReach ? "リーチ済み" : "リーチ（-1000）"}
              </Button>
              <Button variant="default" onClick={() => handleAgariClick(index + 2)}>
                アガり
              </Button>
              <Button variant="ghost" onClick={() => toggleDealer(index + 2)}>
                親にする
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog: 和了入力 */}
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
            <Select value={ronPlayerIndex?.toString() ?? ""} onValueChange={(v) => setRonPlayerIndex(parseInt(v))}>
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

          <div className="flex flex-col gap-2">
            <div className="flex justify-between gap-2">
              <Button onClick={() => handleRon(false)} className="w-full">
                ロン（子）
              </Button>
              <Button onClick={() => handleRon(true)} className="w-full">
                ロン（親）
              </Button>
            </div>
            <div className="flex justify-between gap-2">
              <Button onClick={() => handleTsumo(false)} className="w-full">
                ツモ（子）
              </Button>
              <Button onClick={() => handleTsumo(true)} className="w-full">
                ツモ（親）
              </Button>
            </div>
            <div className="pt-2">
              <Button variant="secondary" onClick={() => setDialogOpen(false)} className="w-full">
                流局（ノーアガリ）
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}