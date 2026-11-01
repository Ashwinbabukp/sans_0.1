'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useStore } from '@/lib/store';
import { resizeImage } from '@/lib/utils';
import { PhotoIcon, UserIcon } from './Icons';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const DEFAULT_BANNER = '/profile-banner.jpg';

export default function ProfileEditor({ open, onClose, onSaved }: Props) {
  const { me, updateMe } = useStore();
  const dlg = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(me.name);
  const [user, setUser] = useState(me.user);
  const [bio, setBio] = useState(me.bio);
  const [avatar, setAvatar] = useState<string | null>(me.avatar ?? null);
  const [banner, setBanner] = useState<string | null>(me.banner ?? null);
  const [error, setError] = useState('');

  const photoInput = useRef<HTMLInputElement>(null);
  const bannerInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(me.name);
      setUser(me.user);
      setBio(me.bio);
      setAvatar(me.avatar ?? null);
      setBanner(me.banner ?? null);
      setError('');
    }
  }, [open, me.name, me.user, me.bio, me.avatar, me.banner]);

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  function save() {
    updateMe({
      name: name.trim() || 'You',
      user: user.toLowerCase().replace(/[^a-z0-9._]/g, '') || 'you',
      bio: bio.trim(),
      avatar,
      banner,
    });
    onSaved();
    onClose();
  }

  async function pickPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setAvatar(await resizeImage(file));
      setError('');
    } catch {
      setError('That file isn’t an image. Choose a photo for your avatar.');
    }
  }

  async function pickBanner(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setBanner(await resizeImage(file));
      setError('');
    } catch {
      setError('That file isn’t an image. Choose a photo for your banner.');
    }
  }

  const activeBanner = banner || DEFAULT_BANNER;

  return (
    <dialog
      ref={dlg}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="profile-title"
    >
      <div className="sheet" style={{ maxWidth: 440 }}>
        <h2 id="profile-title">Edit profile</h2>

        {/* Hidden File Inputs */}
        <input
          ref={bannerInput}
          type="file"
          accept="image/*"
          hidden
          onChange={pickBanner}
        />
        <input
          ref={photoInput}
          type="file"
          accept="image/*"
          hidden
          onChange={pickPhoto}
        />

        {/* Interactive Banner & Avatar Live Preview Section */}
        <div style={{ margin: '14px 0 20px' }}>
          {/* Banner Box */}
          <div
            style={{
              width: '100%',
              height: 120,
              borderRadius: 16,
              backgroundImage: `url("${activeBanner}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              position: 'relative',
              boxShadow: '0 3px 12px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            {/* Banner Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.22)',
              }}
            />

            {/* Change Banner Button */}
            <button
              type="button"
              onClick={() => bannerInput.current?.click()}
              aria-label="Change banner photo"
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'rgba(255,255,255,0.92)',
                color: '#18181B',
                border: 'none',
                borderRadius: 999,
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              <PhotoIcon />
              <span>{banner ? 'Change banner' : 'Upload banner'}</span>
            </button>

            {banner && (
              <button
                type="button"
                onClick={() => setBanner(null)}
                aria-label="Reset banner to default"
                style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 10,
                  background: 'rgba(0,0,0,0.5)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 999,
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Reset banner
              </button>
            )}
          </div>

          {/* Overlapping Avatar Circle */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: -42,
              position: 'relative',
              zIndex: 3,
            }}
          >
            <div
              onClick={() => photoInput.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Change profile photo"
              style={{
                width: 84,
                height: 84,
                borderRadius: '50%',
                backgroundColor: '#EDE8DF',
                backgroundImage: avatar ? `url("${avatar}")` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                border: '3.5px solid #FFFFFF',
                color: '#052BA8',
              }}
            >
              {!avatar && (
                <span
                  style={{
                    width: '42px',
                    height: '42px',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#052BA8',
                  }}
                >
                  <UserIcon />
                </span>
              )}
              <span
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  backgroundColor: '#052BA8',
                  color: '#FAF5EE',
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 2px 6px rgba(5,43,168,0.35)',
                  border: '2px solid #FFFFFF',
                }}
                title="Change photo"
              >
                <PhotoIcon />
              </span>
            </div>

            {/* Avatar controls */}
            <div className="row" style={{ gap: 8, marginTop: 8 }}>
              <button
                type="button"
                className="chip"
                onClick={() => photoInput.current?.click()}
                style={{ fontSize: '0.8rem', padding: '5px 12px' }}
              >
                {avatar ? 'Change photo' : 'Add photo'}
              </button>
              {avatar && (
                <button
                  type="button"
                  className="chip"
                  onClick={() => setAvatar(null)}
                  style={{ fontSize: '0.8rem', padding: '5px 12px' }}
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>

          {error && (
            <p className="err" role="alert" style={{ textAlign: 'center', marginTop: 8 }}>
              {error}
            </p>
          )}
        </div>

        <label>
          Name
          <input
            value={name}
            maxLength={30}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Username
          <input
            value={user}
            maxLength={20}
            onChange={(e) => setUser(e.target.value)}
          />
        </label>
        <label>
          Bio
          <textarea
            value={bio}
            maxLength={80}
            style={{ minHeight: 64 }}
            onChange={(e) => setBio(e.target.value)}
          />
        </label>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="chip" onClick={onClose}>
            Cancel
          </button>
          <button
            className="post"
            style={{
              flex: 1,
              background: '#052BA8',
              color: '#FAF5EE',
              border: 'none',
              borderRadius: 999,
              fontWeight: 700,
            }}
            onClick={save}
          >
            Save profile
          </button>
        </div>
      </div>
    </dialog>
  );
}
