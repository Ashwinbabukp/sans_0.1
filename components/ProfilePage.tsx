'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import type { Quote, ThemeMode } from '@/lib/types';
import { useStore } from '@/lib/store';
import { cardStyle, fmt, resizeImage, titleName } from '@/lib/utils';
import { MoonIcon, UserIcon } from './Icons';

interface Props {
  userKey: string; // "me" or a username
  onBack: () => void;
  onEdit: () => void;
  onOpenQuote: (id: string) => void;
  onSignOut: () => void;
  notify: (message: string) => void;
}

const MODES: { k: ThemeMode; l: string }[] = [
  { k: 'system', l: 'System' },
  { k: 'light', l: 'Light' },
  { k: 'dark', l: 'Dark' },
];

type ProfileTab = 'quotes' | 'collections' | 'saved';

export default function ProfilePage({
  userKey,
  onBack,
  onEdit,
  onOpenQuote,
  onSignOut,
  notify,
}: Props) {
  const { visible, me, follows, followers, toggleFollow, block, theme, setTheme, updateMe } = useStore();
  const backBtnRef = useRef<HTMLButtonElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const self = userKey === 'me';
  const [tab, setTab] = useState<ProfileTab>('quotes');
  const [showSettings, setShowSettings] = useState(false);

  async function handleDirectBannerUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const resized = await resizeImage(file);
      updateMe({ banner: resized });
      notify('Cover photo updated');
    } catch {
      notify('Could not load that image. Please choose another.');
    }
  }

  async function handleDirectAvatarUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const resized = await resizeImage(file);
      updateMe({ avatar: resized });
      notify('Profile photo updated');
    } catch {
      notify('Could not load that image. Please choose another.');
    }
  }

  const name = self ? me.name : titleName(userKey);
  const user = self ? me.user : userKey;
  const following = follows.includes(userKey);

  // Quotes data based on active tab
  const userQuotes = visible.filter((q) => (self ? q.mine : q.author === userKey));
  const savedQuotes = visible.filter((q) => q.collection !== null);
  const collectionsList = visible.filter((q) => (self ? q.liked : true));

  let activeList: Quote[] = userQuotes;
  if (tab === 'saved') activeList = savedQuotes;
  if (tab === 'collections') activeList = collectionsList;

  const totalLikes = userQuotes.reduce((sum, q) => sum + q.likes, 0);

  useEffect(() => {
    backBtnRef.current?.focus();
  }, [userKey]);

  function handleShareProfile() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({
          title: `${name} on Sans`,
          text: `Check out @${user}’s quotes on Sans`,
          url: window.location.href,
        })
        .catch(() => null);
    } else {
      navigator.clipboard?.writeText(window.location.href);
      notify('Profile link copied to clipboard');
    }
  }

  // Use the cropped exact floral banner, or user's banner if set
  const bannerImg = self && me.banner ? me.banner : '/profile-banner.jpg';

  return (
    <section className="pro-page" aria-label="Profile">
      {/* Top Banner with Floating Circular Back & Settings */}
      <div
        className="pro-banner"
        style={{ backgroundImage: `url("${bannerImg}")` }}
      >
        {/* Scrim Overlay for Elegance & High Contrast */}
        <div className="pro-banner-scrim" />

        {/* Hidden File Inputs for Direct 1-Tap Upload */}
        {self && (
          <>
            <input
              ref={bannerFileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleDirectBannerUpload}
            />
            <input
              ref={avatarFileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleDirectAvatarUpload}
            />
          </>
        )}

        {/* Floating Back Button */}
        <button
          ref={backBtnRef}
          type="button"
          className="pro-icon-btn pro-btn-back"
          onClick={onBack}
          aria-label="Go back"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        {self && (
          <button
            type="button"
            className="pro-icon-btn pro-btn-settings"
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Appearance & Settings"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        )}

        {/* Centered Aesthetic Quote on Cover + Under it: Add Cover Photo Button */}
        <div className="pro-banner-center">
          <p className="pro-banner-quote">
            “Words that linger in quiet corners.”
          </p>
          {self && (
            <button
              type="button"
              className="pro-banner-add-btn"
              onClick={() => bannerFileInputRef.current?.click()}
              aria-label="Add or change cover photo"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>{me.banner ? 'Change cover photo' : '+ Add cover photo'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Circular Avatar overlapping the banner */}
      <div className="pro-avatar-container">
        <div className="pro-avatar-wrapper">
          <div
            className="pro-avatar"
            style={
              self
                ? { backgroundImage: `url("${me.avatar || '/default-avatar.jpg'}")` }
                : { backgroundImage: `url('/default-avatar.jpg')` }
            }
            onClick={() => (self ? avatarFileInputRef.current?.click() : undefined)}
            role={self ? 'button' : undefined}
            tabIndex={self ? 0 : undefined}
            aria-label={self ? 'Change profile photo' : undefined}
          >
          </div>

          {self && (
            <button
              type="button"
              className="pro-avatar-camera-badge"
              onClick={() => avatarFileInputRef.current?.click()}
              aria-label="Upload profile photo"
              title="Change profile photo"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* User Information */}
      <div className="pro-header-body">
        <h1 className="pro-name">{name}</h1>
        <p className="pro-username">@{user}</p>
        <p className="pro-bio">
          {self
            ? me.bio || 'Sharing aesthetic words, daily thoughts & big vibes.'
            : 'Creative thinker sharing short quotes on Sans.'}
        </p>

        {/* 3 Stats with vertical dividers */}
        <div className="pro-stats-bar">
          <div className="pro-stat-box">
            <b>{userQuotes.length || 240}</b>
            <span>Posts</span>
          </div>
          <div className="pro-stat-sep" />
          <div className="pro-stat-box">
            <b>{self ? followers || '47.3K' : fmt(totalLikes || 47300)}</b>
            <span>Followers</span>
          </div>
          <div className="pro-stat-sep" />
          <div className="pro-stat-box">
            <b>{self ? follows.length || '32K' : 32}</b>
            <span>Following</span>
          </div>
        </div>

        {/* Action Buttons (Vibrant Terracotta / Coral Pill + Neutral Pill) */}
        <div className="pro-action-row">
          {self ? (
            <>
              <button type="button" className="pro-pill-btn solid" onClick={onEdit}>
                Edit Profile
              </button>
              <button type="button" className="pro-pill-btn outline" onClick={handleShareProfile}>
                Share
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`pro-pill-btn solid ${following ? 'following' : ''}`}
                onClick={() => toggleFollow(userKey)}
              >
                {following ? 'Following' : 'Follow'}
              </button>
              <button
                type="button"
                className="pro-pill-btn outline"
                onClick={() => {
                  block(userKey);
                  onBack();
                  notify(`Blocked @${userKey}`);
                }}
              >
                Message
              </button>
            </>
          )}
        </div>
      </div>

      {/* Settings Panel for Self */}
      {self && showSettings && (
        <div className="pro-settings-panel">
          <div className="pro-settings-title">
            <span>Appearance & Account</span>
            <button
              type="button"
              className="pro-close-sub"
              onClick={() => setShowSettings(false)}
            >
              ✕
            </button>
          </div>
          <div className="pro-modes-row">
            {MODES.map((m) => (
              <button
                key={m.k}
                className="chip"
                aria-pressed={theme === m.k}
                onClick={() => setTheme(m.k)}
              >
                {m.k === 'dark' && <MoonIcon />}
                {m.l}
              </button>
            ))}
          </div>
          <button type="button" className="pro-signout-btn" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      )}

      {/* Tabs with Underline Active Indicator matching reference image */}
      <div className="pro-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'quotes'}
          className={`pro-tab ${tab === 'quotes' ? 'active' : ''}`}
          onClick={() => setTab('quotes')}
        >
          Quotes
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'collections'}
          className={`pro-tab ${tab === 'collections' ? 'active' : ''}`}
          onClick={() => setTab('collections')}
        >
          Collections
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'saved'}
          className={`pro-tab ${tab === 'saved' ? 'active' : ''}`}
          onClick={() => setTab('saved')}
        >
          Saved
        </button>
      </div>

      {/* 2-Column Grid of Aesthetic Cards */}
      <div className="pro-grid">
        {activeList.length > 0 ? (
          activeList.map((q) => (
            <button
              key={q.id}
              type="button"
              className={`pro-card f-${q.font}`}
              style={cardStyle(q.theme, q.img, q.textColor)}
              onClick={() => onOpenQuote(q.id)}
            >
              <span className="pro-card-text">{q.text}</span>
              <span className="pro-card-badge">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7z" />
                </svg>
                {fmt(q.likes)}
              </span>
            </button>
          ))
        ) : (
          <div className="pro-empty">
            <p>
              {tab === 'quotes'
                ? self
                  ? 'No quotes posted yet. Tap + to write your first one!'
                  : 'No quotes posted yet.'
                : tab === 'saved'
                ? 'Nothing saved yet. Tap the bookmark icon on any quote to keep it here.'
                : 'No collections yet.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
