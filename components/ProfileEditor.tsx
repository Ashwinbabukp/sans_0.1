'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useStore } from '@/lib/store';
import { resizeImage } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function ProfileEditor({ open, onClose, onSaved }: Props) {
  const { me, updateMe } = useStore();
  const dlg = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(me.name);
  const [user, setUser] = useState(me.user);
  const [bio, setBio] = useState(me.bio);
  const [avatar, setAvatar] = useState<string | null>(me.avatar ?? null);
  const [error, setError] = useState('');
  const photoInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(me.name);
      setUser(me.user);
      setBio(me.bio);
      setAvatar(me.avatar ?? null);
      setError('');
    }
  }, [open, me.name, me.user, me.bio, me.avatar]);

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
      setError('That file isn’t an image. Choose a photo.');
    }
  }

  return (
    <dialog
      ref={dlg}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-labelledby="profile-title"
    >
      <div className="sheet">
        <h2 id="profile-title">Your profile</h2>
        <div className="grp">
          <span className="lbl">Profile photo</span>
          <input
            ref={photoInput}
            type="file"
            accept="image/*"
            hidden
            onChange={pickPhoto}
          />
          <div className="row">
            <button
              className="chip"
              onClick={() => photoInput.current?.click()}
            >
              {avatar ? 'Change photo' : 'Choose photo'}
            </button>
            {avatar && (
              <button className="chip" onClick={() => setAvatar(null)}>
                Remove photo
              </button>
            )}
          </div>
          {error && (
            <p className="err" role="alert">
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
        <div className="row">
          <button className="chip" onClick={onClose}>
            Cancel
          </button>
          <button className="post" style={{ flex: 1 }} onClick={save}>
            Save profile
          </button>
        </div>
      </div>
    </dialog>
  );
}
