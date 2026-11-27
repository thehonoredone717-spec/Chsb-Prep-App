import {
  ArrowRight,
  Check,
  CheckCircle2,
  Coins,
  Crown,
  Eye,
  Flame,
  Lock,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Tag,
  Trophy,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { UserProfile } from '../firebase';
import { UILanguage } from '../types/quiz';
import { playSound } from '../utils/sound';
import {
  STORE_FRAMES,
  STORE_FRAME_MAP,
  STORE_TIER_META,
  STORE_TITLES,
  STORE_TITLE_MAP,
  StoreFrameItem,
  StoreTitleItem,
  UserCosmetics,
  getStoreTierLabel,
} from '../utils/xpAndStore';
import { AppView } from './TopBar';
import { UserAvatarFrame, UserTitleLabel } from './UserAvatarFrame';

interface StoreViewProps {
  lang: UILanguage;
  userProfile: UserProfile;
  isTeacher: boolean;
  earnedXp: number;
  cosmetics: UserCosmetics;
  savingItemId: string | null;
  storeError: string | null;
  onBuyTitle: (item: StoreTitleItem) => Promise<boolean>;
  onBuyFrame: (item: StoreFrameItem) => Promise<boolean>;
  onEquipTitle: (titleId: string) => Promise<boolean>;
  onEquipFrame: (frameId: string) => Promise<boolean>;
  onNavigate: (view: AppView) => void;
}

type StoreTab = 'all' | 'titles' | 'frames' | 'owned';

export function StoreView({
  lang,
  userProfile,
  isTeacher,
  earnedXp,
  cosmetics,
  savingItemId,
  storeError,
  onBuyTitle,
  onBuyFrame,
  onEquipTitle,
  onEquipFrame,
  onNavigate,
}: StoreViewProps) {
  const uz = lang === 'uz';
  const [activeTab, setActiveTab] = useState<StoreTab>('all');
  const [previewTitleId, setPreviewTitleId] = useState<string | null>(null);
  const [previewFrameId, setPreviewFrameId] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const availableXp = Math.max(0, earnedXp - cosmetics.spentXp);

  const effectiveTitleId = previewTitleId ?? cosmetics.equippedTitle;
  const effectiveFrameId = previewFrameId ?? cosmetics.equippedFrame;
  const isPreviewing = previewTitleId !== null || previewFrameId !== null;

  const ownedTitleSet = useMemo(() => new Set(cosmetics.ownedTitles), [cosmetics.ownedTitles]);
  const ownedFrameSet = useMemo(() => new Set(cosmetics.ownedFrames), [cosmetics.ownedFrames]);

  const visibleTitles = useMemo(() => {
    if (activeTab === 'frames') return [];
    if (activeTab === 'owned') return STORE_TITLES.filter((t) => ownedTitleSet.has(t.id));
    return STORE_TITLES;
  }, [activeTab, ownedTitleSet]);

  const visibleFrames = useMemo(() => {
    if (activeTab === 'titles') return [];
    if (activeTab === 'owned') return STORE_FRAMES.filter((f) => ownedFrameSet.has(f.id));
    return STORE_FRAMES;
  }, [activeTab, ownedFrameSet]);

  const showNotice = (msg: string) => {
    setStatusNotice(msg);
    window.setTimeout(() => {
      setStatusNotice((curr) => (curr === msg ? null : curr));
    }, 2800);
  };

  const handleBuyTitleClick = async (item: StoreTitleItem) => {
    if (availableXp < item.price || savingItemId) return;
    const ok = await onBuyTitle(item);
    if (ok) {
      playSound('complete');
      setPreviewTitleId(null);
      showNotice(
        uz
          ? `"${item.label.uz}" tituli sotib olindi va taqildi!`
          : `Unlocked and equipped "${item.label.en}"!`
      );
    }
  };

  const handleBuyFrameClick = async (item: StoreFrameItem) => {
    if (availableXp < item.price || savingItemId) return;
    const ok = await onBuyFrame(item);
    if (ok) {
      playSound('complete');
      setPreviewFrameId(null);
      showNotice(
        uz
          ? `"${item.label.uz}" ramkasi sotib olindi va taqildi!`
          : `Unlocked and equipped "${item.label.en}"!`
      );
    }
  };

  const handleEquipTitleClick = async (titleId: string) => {
    if (savingItemId) return;
    const nextId = cosmetics.equippedTitle === titleId ? '' : titleId;
    const ok = await onEquipTitle(nextId);
    if (ok) {
      playSound('click');
      setPreviewTitleId(null);
    }
  };

  const handleEquipFrameClick = async (frameId: string) => {
    if (savingItemId) return;
    const nextId = cosmetics.equippedFrame === frameId ? '' : frameId;
    const ok = await onEquipFrame(nextId);
    if (ok) {
      playSound('click');
      setPreviewFrameId(null);
    }
  };

  const equippedTitleObj = cosmetics.equippedTitle
    ? STORE_TITLE_MAP[cosmetics.equippedTitle]
    : undefined;
  const equippedFrameObj = cosmetics.equippedFrame
    ? STORE_FRAME_MAP[cosmetics.equippedFrame]
    : undefined;

  return (
    <section className="space-y-6">
      {/* Live Profile Showcase & XP Balance Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          {/* Left: Live Avatar + Title Preview */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <UserAvatarFrame
              name={userProfile.displayName}
              isTeacher={isTeacher}
              frameId={effectiveFrameId}
              size="xl"
            />

            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                <span>
                  {uz ? 'XP Do‘koni · Profil Bezagi' : 'XP Store · Titles & Frames'}
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-baseline gap-2.5">
                <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  {userProfile.displayName}
                </h1>
                {effectiveTitleId && (
                  <UserTitleLabel titleId={effectiveTitleId} lang={lang} className="text-sm" />
                )}
              </div>

              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-600">
                {uz
                  ? 'Testlar va 60s Blitz o‘yinlarida to‘plagan XP ballaringiz evaziga darajasi oshib boruvchi maxsus titullar va profil ramkalarini xarid qiling.'
                  : 'Spend XP earned from tests and 60s Blitz runs to unlock escalating titles and profile frames.'}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>
                  {uz ? 'Joriy titul:' : 'Equipped title:'}{' '}
                  <strong className="text-slate-800">
                    {equippedTitleObj
                      ? uz
                        ? equippedTitleObj.label.uz
                        : equippedTitleObj.label.en
                      : uz
                        ? 'Tanlanmagan'
                        : 'None'}
                  </strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {uz ? 'Joriy ramka:' : 'Equipped frame:'}{' '}
                  <strong className="text-slate-800">
                    {equippedFrameObj
                      ? uz
                        ? equippedFrameObj.label.uz
                        : equippedFrameObj.label.en
                      : uz
                        ? 'Standart'
                        : 'Default'}
                  </strong>
                </span>
                {isPreviewing && (
                  <>
                    <span aria-hidden="true">·</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewTitleId(null);
                        setPreviewFrameId(null);
                      }}
                      className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-800"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{uz ? 'Ko‘rishni bekor qilish' : 'Reset preview'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: XP Wallet Summary */}
          <div className="grid grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:min-w-[320px]">
            <div>
              <p className="text-[11px] font-semibold text-slate-500">
                {uz ? 'Mavjud XP' : 'Available XP'}
              </p>
              <p className="font-mono-num mt-1 flex items-center gap-1 text-xl font-extrabold text-teal-700">
                <Coins className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                <span>{availableXp}</span>
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">
                {uz ? 'Jami XP' : 'Earned XP'}
              </p>
              <p className="font-mono-num mt-1 text-xl font-extrabold text-slate-900">
                {earnedXp}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">
                {uz ? 'Kolleksiya' : 'Owned'}
              </p>
              <p className="font-mono-num mt-1 text-xl font-extrabold text-slate-900">
                {cosmetics.ownedTitles.length + cosmetics.ownedFrames.length}/
                {STORE_TITLES.length + STORE_FRAMES.length}
              </p>
            </div>
          </div>
        </div>

        {(statusNotice || storeError) && (
          <div
            role="status"
            className={`mt-4 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold ${
              storeError
                ? 'border-rose-200 bg-rose-50 text-rose-800'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800'
            }`}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{storeError || statusNotice}</span>
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label={uz ? 'Do‘kon bo‘limlari' : 'Store categories'}
          className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white p-1"
        >
          {(
            [
              { id: 'all', label: uz ? 'Barchasi (16)' : 'All Items (16)' },
              {
                id: 'titles',
                label: uz
                  ? `Titullar (${STORE_TITLES.length})`
                  : `Titles (${STORE_TITLES.length})`,
              },
              {
                id: 'frames',
                label: uz
                  ? `Ramkalar (${STORE_FRAMES.length})`
                  : `Frames (${STORE_FRAMES.length})`,
              },
              {
                id: 'owned',
                label: uz
                  ? `Mening kolleksiyam (${cosmetics.ownedTitles.length + cosmetics.ownedFrames.length})`
                  : `Owned (${cosmetics.ownedTitles.length + cosmetics.ownedFrames.length})`,
              },
            ] as Array<{ id: StoreTab; label: string }>
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-[38px] whitespace-nowrap rounded-lg px-3.5 text-xs font-semibold transition-colors sm:text-sm ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {(cosmetics.equippedTitle || cosmetics.equippedFrame) && (
          <div className="flex flex-wrap items-center gap-2">
            {cosmetics.equippedTitle && (
              <button
                type="button"
                disabled={savingItemId !== null}
                onClick={() => void handleEquipTitleClick(cosmetics.equippedTitle)}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <span>{uz ? 'Titulni yechish' : 'Unequip Title'}</span>
              </button>
            )}
            {cosmetics.equippedFrame && (
              <button
                type="button"
                disabled={savingItemId !== null}
                onClick={() => void handleEquipFrameClick(cosmetics.equippedFrame)}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <span>{uz ? 'Ramkani yechish' : 'Unequip Frame'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Empty Owned Tab State */}
      {activeTab === 'owned' && visibleTitles.length === 0 && visibleFrames.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <ShoppingBag className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
          <h2 className="mt-3 font-display text-lg font-bold text-slate-900">
            {uz ? 'Kolleksiyangiz hali bo‘sh' : 'No unlocked items yet'}
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
            {uz
              ? 'Titullar va ramkalar bo‘limidan ilk bezagingizni XP evaziga xarid qiling yoki test topshirib XP yig‘ing.'
              : 'Browse Titles and Frames to unlock your first cosmetic item with XP.'}
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className="mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
          >
            <span>{uz ? 'Do‘konni ko‘rish' : 'Browse Store'}</span>
          </button>
        </div>
      )}

      {/* Section 1: Titles (Narxi darajaga qarab oshib boradi) */}
      {visibleTitles.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-2.5">
            <div>
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
                <Tag className="h-4 w-4 text-teal-700" aria-hidden="true" />
                <span>{uz ? 'Profil Titullari' : 'Profile Titles'}</span>
              </h2>
              <p className="text-xs text-slate-500">
                {uz
                  ? 'Oddiy darajadan Mifik darajagacha — titul nufuzi oshgani sari narxi ham ko‘tariladi (1,200 → 30,000 XP)'
                  : 'Tiered progression from Common to Mythic — prices scale with prestige (1,200 → 30,000 XP)'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {visibleTitles.map((item) => {
              const owned = ownedTitleSet.has(item.id);
              const equipped = cosmetics.equippedTitle === item.id;
              const previewed = previewTitleId === item.id;
              const canAfford = availableXp >= item.price;
              const missingXp = Math.max(0, item.price - availableXp);
              const progressPct = Math.min(100, Math.round((availableXp / item.price) * 100));
              const tierMeta = STORE_TIER_META[item.tier];
              const isBusy = savingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className={`flex flex-col justify-between rounded-xl border bg-white p-5 transition-transform duration-150 hover:-translate-y-0.5 ${
                    equipped
                      ? 'border-teal-600 ring-1 ring-teal-600/20'
                      : previewed
                        ? 'border-amber-500'
                        : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className={`font-semibold ${tierMeta.textClass}`}>
                        {getStoreTierLabel(item.tier, lang)}
                      </span>
                      <span className="font-mono-num font-bold text-slate-900">
                        {item.price} XP
                      </span>
                    </div>

                    {/* Visual Title Preview Strip */}
                    <div className="mt-3 flex min-h-[64px] flex-col items-center justify-center rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-3 text-center">
                      <span className="text-[11px] font-semibold text-slate-500">
                        {userProfile.displayName}
                      </span>
                      <UserTitleLabel titleId={item.id} lang={lang} className="mt-0.5 text-sm" />
                    </div>

                    <h3 className="mt-3 font-display text-base font-bold text-slate-900">
                      {uz ? item.label.uz : item.label.en}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      {uz ? item.description.uz : item.description.en}
                    </p>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                    {!owned && !canAfford && (
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full ${tierMeta.accentClass} transition-all duration-300`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {owned ? (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void handleEquipTitleClick(item.id)}
                          className={`inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors ${
                            equipped
                              ? 'bg-teal-700 text-white hover:bg-teal-800'
                              : 'border border-slate-200 bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                        >
                          {equipped ? (
                            <>
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>{uz ? 'Jihozlangan' : 'Equipped'}</span>
                            </>
                          ) : (
                            <span>{uz ? 'Taqish' : 'Equip'}</span>
                          )}
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            disabled={!canAfford || isBusy}
                            onClick={() => void handleBuyTitleClick(item)}
                            className={`inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors ${
                              canAfford
                                ? 'bg-teal-700 text-white hover:bg-teal-800'
                                : 'cursor-not-allowed bg-slate-100 text-slate-500'
                            }`}
                          >
                            {isBusy ? (
                              <span>{uz ? 'Saqlanmoqda...' : 'Saving...'}</span>
                            ) : canAfford ? (
                              <>
                                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>
                                  {uz ? `Sotib olish · ${item.price} XP` : `Buy · ${item.price} XP`}
                                </span>
                              </>
                            ) : (
                              <>
                                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>
                                  {uz ? `Yana ${missingXp} XP` : `Need ${missingXp} XP`}
                                </span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setPreviewTitleId((curr) => (curr === item.id ? null : item.id))
                            }
                            title={uz ? 'Profilda sinab ko‘rish' : 'Preview on profile'}
                            aria-label={uz ? 'Profilda sinab ko‘rish' : 'Preview on profile'}
                            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                              previewed
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 2: Frames (Ramkalar — narxi ramkaga qarab oshib boradi) */}
      {visibleFrames.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-2.5">
            <div>
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
                <Crown className="h-4 w-4 text-amber-600" aria-hidden="true" />
                <span>{uz ? 'Profil Ramkalari' : 'Avatar Frames'}</span>
              </h2>
              <p className="text-xs text-slate-500">
                {uz
                  ? 'Oddiy halqadan tojli Mifik Imperator ramkasigacha — har bir darajada dizayn va narx oshadi (1,800 → 35,000 XP)'
                  : 'From crisp Emerald Ring to animated Mythic Emperor — price rises with frame tier & effects (1,800 → 35,000 XP)'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {visibleFrames.map((item) => {
              const owned = ownedFrameSet.has(item.id);
              const equipped = cosmetics.equippedFrame === item.id;
              const previewed = previewFrameId === item.id;
              const canAfford = availableXp >= item.price;
              const missingXp = Math.max(0, item.price - availableXp);
              const progressPct = Math.min(100, Math.round((availableXp / item.price) * 100));
              const tierMeta = STORE_TIER_META[item.tier];
              const isBusy = savingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className={`flex flex-col justify-between rounded-xl border bg-white p-5 transition-transform duration-150 hover:-translate-y-0.5 ${
                    equipped
                      ? 'border-teal-600 ring-1 ring-teal-600/20'
                      : previewed
                        ? 'border-amber-500'
                        : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className={`font-semibold ${tierMeta.textClass}`}>
                        {getStoreTierLabel(item.tier, lang)}
                      </span>
                      <span className="font-mono-num font-bold text-slate-900">
                        {item.price} XP
                      </span>
                    </div>

                    {/* Visual Frame Preview Box */}
                    <div className="mt-3 flex min-h-[116px] items-center justify-center rounded-lg border border-slate-100 bg-slate-50/80 py-4">
                      <UserAvatarFrame
                        name={userProfile.displayName}
                        isTeacher={isTeacher}
                        frameId={item.id}
                        size="xl"
                      />
                    </div>

                    <h3 className="mt-3 font-display text-base font-bold text-slate-900">
                      {uz ? item.label.uz : item.label.en}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">
                      {uz ? item.description.uz : item.description.en}
                    </p>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                    {!owned && !canAfford && (
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full ${tierMeta.accentClass} transition-all duration-300`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {owned ? (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void handleEquipFrameClick(item.id)}
                          className={`inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors ${
                            equipped
                              ? 'bg-teal-700 text-white hover:bg-teal-800'
                              : 'border border-slate-200 bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                        >
                          {equipped ? (
                            <>
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>{uz ? 'Jihozlangan' : 'Equipped'}</span>
                            </>
                          ) : (
                            <span>{uz ? 'Taqish' : 'Equip'}</span>
                          )}
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            disabled={!canAfford || isBusy}
                            onClick={() => void handleBuyFrameClick(item)}
                            className={`inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors ${
                              canAfford
                                ? 'bg-teal-700 text-white hover:bg-teal-800'
                                : 'cursor-not-allowed bg-slate-100 text-slate-500'
                            }`}
                          >
                            {isBusy ? (
                              <span>{uz ? 'Saqlanmoqda...' : 'Saving...'}</span>
                            ) : canAfford ? (
                              <>
                                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>
                                  {uz ? `Sotib olish · ${item.price} XP` : `Buy · ${item.price} XP`}
                                </span>
                              </>
                            ) : (
                              <>
                                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>
                                  {uz ? `Yana ${missingXp} XP` : `Need ${missingXp} XP`}
                                </span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setPreviewFrameId((curr) => (curr === item.id ? null : item.id))
                            }
                            title={uz ? 'Profilda sinab ko‘rish' : 'Preview on profile'}
                            aria-label={uz ? 'Profilda sinab ko‘rish' : 'Preview on profile'}
                            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                              previewed
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <Eye className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* How to Earn More XP Strip */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
              <Trophy className="h-4 w-4 text-amber-600" aria-hidden="true" />
              <span>{uz ? 'XP qanday yig‘iladi?' : 'How to earn XP'}</span>
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
              {uz
                ? 'Har bir to‘g‘ri test javobi +6 XP · 4 baho (65%+) uchun +15 bonus XP · 5 baho (86%+) uchun +40 bonus XP · 60s Blitz rekordingiz ham to‘g‘ridan-to‘g‘ri XP beradi.'
                : 'Every correct quiz answer grants +6 XP · Grade 4 (65%+) adds +15 bonus XP · Grade 5 (86%+) adds +40 bonus XP · Your 60s Blitz high score adds straight to XP.'}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Flame className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
              <span>{uz ? '60s Blitz o‘ynash' : 'Play 60s Blitz'}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('test')}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-teal-700 px-4 text-xs font-semibold text-white transition-colors hover:bg-teal-800"
            >
              <span>{uz ? 'Test yechish' : 'Start a Quiz'}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
