import { useState } from 'react';
import { Sparkles, X, Gift, Trophy, Coins } from 'lucide-react';
import { UILanguage } from '../types/quiz';
import { playSound } from '../utils/sound';
import { STORE_TITLES, STORE_FRAMES, UserCosmetics, StoreTitleItem, StoreFrameItem } from '../utils/xpAndStore';

interface MysteryBoxModalProps {
  lang: UILanguage;
  availableXp: number;
  cosmetics: UserCosmetics;
  onUnlockCosmetic: (type: 'title' | 'frame', id: string) => Promise<boolean>;
  onClose: () => void;
}

export function MysteryBoxModal({
  lang,
  availableXp,
  cosmetics,
  onUnlockCosmetic,
  onClose,
}: MysteryBoxModalProps) {
  const uz = lang === 'uz';
  const BOX_COST = 3000;
  const [isOpening, setIsOpening] = useState(false);
  const [reward, setReward] = useState<{
    type: 'title' | 'frame' | 'xp';
    name: { uz: string; en: string };
    id?: string;
    xpAmount?: number;
  } | null>(null);

  const canOpen = availableXp >= BOX_COST;

  const handleOpenBox = async () => {
    if (!canOpen || isOpening) return;
    setIsOpening(true);
    playSound('warning');

    setTimeout(async () => {
      playSound('complete');
      setIsOpening(false);

      const unownedTitles = STORE_TITLES.filter((t: StoreTitleItem) => !cosmetics.ownedTitles.includes(t.id));
      const unownedFrames = STORE_FRAMES.filter((f: StoreFrameItem) => !cosmetics.ownedFrames.includes(f.id));

      const pool: Array<{ type: 'title' | 'frame'; item: StoreTitleItem | StoreFrameItem }> = [
        ...unownedTitles.map((t: StoreTitleItem) => ({ type: 'title' as const, item: t })),
        ...unownedFrames.map((f: StoreFrameItem) => ({ type: 'frame' as const, item: f })),
      ];

      if (pool.length > 0) {
        const winning = pool[Math.floor(Math.random() * pool.length)];
        await onUnlockCosmetic(winning.type, winning.item.id);
        setReward({
          type: winning.type,
          name: winning.item.label,
          id: winning.item.id,
        });
      } else {
        setReward({
          type: 'xp',
          name: { uz: '5,000 Bonus XP Jackpot!', en: '5,000 Bonus XP Jackpot!' },
          xpAmount: 5000,
        });
      }
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
            <Gift className="h-5 w-5 text-rose-600 animate-bounce" aria-hidden="true" />
            <span>{uz ? 'Sirli Sovg‘a Qutisi (Gacha)' : 'Mystery Loot Box'}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="py-6 text-center">
          {!reward ? (
            <>
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shadow-lg shadow-rose-500/30">
                <Gift className={`h-12 w-12 text-white ${isOpening ? 'animate-spin' : 'animate-pulse'}`} />
              </div>
              <p className="mt-4 font-display text-base font-bold text-slate-900">
                {uz ? 'Noma’lum afsonaviy sovg‘ani oching!' : 'Unbox a rare mystery reward!'}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {uz
                  ? 'Har bir quti ochish 3,000 XP turadi va sizga kafolatlangan yangi titul, ramka yoki XP yutug‘ini beradi.'
                  : 'Each box costs 3,000 XP and guarantees an unowned cosmetic or bonus XP jackpot.'}
              </p>

              <div className="mt-6">
                <button
                  type="button"
                  disabled={!canOpen || isOpening}
                  onClick={() => void handleOpenBox()}
                  className={`inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white transition-all shadow-md ${
                    canOpen && !isOpening
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-teal-600/30'
                      : 'cursor-not-allowed bg-slate-200 text-slate-500 shadow-none'
                  }`}
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {isOpening
                      ? uz
                        ? 'Ochilmoqda...'
                        : 'Opening Box...'
                      : uz
                        ? `Qutini ochish · ${BOX_COST} XP`
                        : `Open Mystery Box · ${BOX_COST} XP`}
                  </span>
                </button>
                {!canOpen && (
                  <p className="mt-2 text-xs font-semibold text-rose-600">
                    {uz
                      ? `Yetarli XP yo‘q (Yana ${BOX_COST - availableXp} XP kerak)`
                      : `Not enough XP (Need ${BOX_COST - availableXp} more XP)`}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 animate-bounce">
                {reward.type === 'xp' ? (
                  <Coins className="h-12 w-12 text-white" />
                ) : (
                  <Trophy className="h-12 w-12 text-white" />
                )}
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-emerald-700">
                {uz ? 'Tabriklaymiz! Yangi Sovg‘a Ochildi!' : 'Congratulations! Reward Unlocked!'}
              </p>
              <h3 className="mt-1 font-display text-xl font-extrabold text-slate-900">
                {uz ? reward.name.uz : reward.name.en}
              </h3>
              <p className="mt-2 text-xs text-slate-600">
                {uz
                  ? 'Sovg‘angiz avtomatik ravishda profilingizga qo‘shildi.'
                  : 'Your reward has been automatically added to your profile.'}
              </p>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex min-h-[40px] w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  <span>{uz ? 'Ajoyib, davom etish' : 'Awesome, Continue'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
