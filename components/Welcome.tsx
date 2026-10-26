'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';

export default function Welcome() {
  const { me, signIn } = useStore();
  const [name, setName] = useState(me.name === 'You' ? '' : me.name);
  const [user, setUser] = useState(me.user === 'you' ? '' : me.user);

  function go() {
    const u = user.toLowerCase().replace(/[^a-z0-9._]/g, '');
    signIn({ name: name.trim() || 'You', user: u || 'you', bio: me.bio });
  }

  return (
    <section className="welcome" aria-label="Welcome">
      <span className="wm">sans<span className="dot">.</span></span>
      <p>Write short quotes. Swipe through other people’s. Share the ones that hit.</p>
      <label>Your name<input value={name} maxLength={30} placeholder="Meera" onChange={(e) => setName(e.target.value)} /></label>
      <label>Username<input value={user} maxLength={20} placeholder="meera.writes" onChange={(e) => setUser(e.target.value)} /></label>
      <button className="post" onClick={go}>Get started</button>
      <small>Your profile is saved on this device.</small>
    </section>
  );
}
