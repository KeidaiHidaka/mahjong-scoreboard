// store/mahjongStore.ts
import { create } from "zustand";

type Player = {
  name: string;
  score: number;
  isReach: boolean;
  isDealer: boolean;
};

type MahjongState = {
  players: Player[];
  reachSticks: number;
  setPlayers: (players: Player[]) => void;
  addScore: (index: number, delta: number) => void;
  toggleReach: (index: number) => void;
  rotateDealer: () => void;
};

export const useMahjongStore = create<MahjongState>((set) => ({
  players: [
    { name: "プレイヤー1", score: 25000, isReach: false, isDealer: true },
    { name: "プレイヤー2", score: 25000, isReach: false, isDealer: false },
    { name: "プレイヤー3", score: 25000, isReach: false, isDealer: false },
    { name: "プレイヤー4", score: 25000, isReach: false, isDealer: false },
  ],
  reachSticks: 0,

  setPlayers: (players) => set({ players }),

  addScore: (index, delta) =>
    set((state) => {
      const updatedPlayers = [...state.players];
      updatedPlayers[index].score += delta;
      return { players: updatedPlayers };
    }),

  toggleReach: (index) =>
    set((state) => {
      const updatedPlayers = [...state.players];
      const player = updatedPlayers[index];

      if (!player.isReach && player.score >= 1000) {
        player.score -= 1000;
        state.reachSticks += 1;
        player.isReach = true;
      } else if (player.isReach) {
        // リーチ解除（必要なら）
        player.score += 1000;
        state.reachSticks -= 1;
        player.isReach = false;
      }

      return {
        players: updatedPlayers,
        reachSticks: state.reachSticks,
      };
    }),

  rotateDealer: () =>
    set((state) => {
      const newPlayers = state.players.map((p) => ({ ...p, isDealer: false }));
      const dealerIndex = state.players.findIndex((p) => p.isDealer);
      const nextDealer = (dealerIndex + 1) % state.players.length;
      newPlayers[nextDealer].isDealer = true;
      return { players: newPlayers };
    }),
}));
