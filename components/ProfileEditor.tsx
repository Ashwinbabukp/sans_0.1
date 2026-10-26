'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';

interface Props { open: boolean; onClose: () => void; onSaved: () => void }

export default function ProfileEditor({ open, onClose, onSaved }: Props) {
  const { me, updateMe } = useStore();
  const dlg = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(me.name);
  const [user, setUser] = useState(me.user);
  const [bio, setBio] = useState(me.bio);

  useEffect(() => {
    if (open) { setName(me.name); setUser(me.user); setBio(me.bio); }
  }, [open, me]);

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
    });
    onSaved();
    onClose();
  }

  return (
    <dialog ref={dlg} onClose={onClose} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} aria-labelledby="profile-title">
      <div className="sheet">
        <h2 id="profile-title">Your profile</h2>
        <label>Name<input value={name} maxLength={30} onChange={(e) => setName(e.target.value)} /></label>
        <label>Username<input value={user} maxLength={20} onChange={(e) => setUser(e.target.value)} /></label>
        <label>Bio<textarea value={bio} maxLength={80} style={{ minHeight: 64 }} onChange={(e) => setBio(e.target.value)} /></label>
        <div className="row">
          <button className="chip" onClick={onClose}>Cancel</button>
          <button className="post" style={{ flex: 1 }} onClick={save}>Save profile</button>
        </div>
      </div>
    </dialog>
  );
}
