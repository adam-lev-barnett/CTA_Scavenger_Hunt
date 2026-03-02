import { FormEvent, useState } from 'react';

export default function ContactPage() {
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [subject,   setSubject]   = useState('');
  const [message,   setMessage]   = useState('');
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12 animate-fade-up">

      <div className="space-y-1 mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-cta-blue">Contact</p>
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Get in touch</h1>
        <p className="text-sm text-zinc-500">Bug report, feature idea, or just want to say hi?</p>
      </div>

      {submitted ? (
        <div className="card px-6 py-10 text-center space-y-3">
          <p className="text-3xl">✓</p>
          <h3 className="font-display font-semibold text-white">Message sent</h3>
          <p className="text-sm text-zinc-500">We'll get back to you as soon as possible.</p>
          <button
            className="btn btn-ghost mt-2"
            onClick={() => { setSubmitted(false); setName(''); setEmail(''); setSubject(''); setMessage(''); }}
          >
            Send another
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="card px-6 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Name</label>
              <input className="input" type="text" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="jane@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="label">Subject</label>
            <input className="input" type="text" placeholder="Bug / Feature / Other" value={subject} onChange={e => setSubject(e.target.value)} required />
          </div>

          <div>
            <label className="label">Message</label>
            <textarea
              className="input resize-none"
              rows={5}
              placeholder="What's on your mind?"
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full justify-center py-2.5">
            Send Message
          </button>
        </form>
      )}

      <div className="grid grid-cols-2 gap-3 mt-4">
        {[
          { emoji: '🐛', title: 'Found a bug?',    body: 'Describe what happened and we\'ll fix it fast.' },
          { emoji: '📍', title: 'Suggest a spot',  body: 'Know a hidden Chicago gem? We\'ll add it.' },
        ].map(c => (
          <div key={c.title} className="card px-4 py-4 space-y-1">
            <span className="text-xl">{c.emoji}</span>
            <p className="font-display font-semibold text-sm text-white">{c.title}</p>
            <p className="text-xs text-zinc-500">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
