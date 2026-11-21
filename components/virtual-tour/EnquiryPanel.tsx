"use client";

import { useState } from "react";
import { CONTACT, getLocation } from "./data";
import { useTour } from "./store";

/**
 * Routes visitors to Touchwood Bliss's existing booking engine, phone lines,
 * reservations email and contact page. No booking is created here.
 */
export default function EnquiryPanel() {
  const { enquiryOpen, enquiryFor, closeEnquiry } = useTour();
  const loc = getLocation(enquiryFor);
  const [form, setForm] = useState({ name: "", phone: "", checkIn: "", checkOut: "", message: "" });
  if (!enquiryOpen) return null;

  const subject = `Enquiry${loc ? `: ${loc.name}` : ""} (via Virtual Tour)`;
  const body = [
    `Name: ${form.name}`,
    `Phone: ${form.phone}`,
    `Check in: ${form.checkIn}`,
    `Check out: ${form.checkOut}`,
    loc ? `Interested in: ${loc.name}` : "",
    "",
    form.message,
  ].join("\n");
  const mailto = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const field = "w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#f3d9a4]/70";

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-3 backdrop-blur-sm sm:items-center" onClick={closeEnquiry}>
      <div role="dialog" aria-modal="true" aria-label="Enquire" onClick={(e) => e.stopPropagation()} className="tb-panel-in tb-glass max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6 sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#f3d9a4]">Reservations</p>
            <h2 className="tb-serif mt-1 text-3xl text-white">{loc ? `Enquire about ${loc.name}` : "Plan your stay"}</h2>
          </div>
          <button onClick={closeEnquiry} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <a href={CONTACT.bookingUrl} target="_blank" rel="noopener noreferrer" className="tb-btn-primary mt-6 w-full">
          Check availability & book online
        </a>

        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {CONTACT.phones.map((p) => (
            <a key={p.number} href={`tel:${p.number.replace(/\s/g, "")}`} className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 hover:border-[#f3d9a4]/50">
              <span className="block text-[10px] uppercase tracking-[0.16em] text-white/55">{p.label}</span>
              <span className="text-sm text-white">{p.number}</span>
            </a>
          ))}
        </div>

        <form
          className="mt-6 space-y-2.5 border-t border-white/10 pt-6"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = mailto;
          }}
        >
          <p className="text-xs text-white/65">Or send an enquiry to {CONTACT.email}. This opens your email app with the details filled in.</p>
          <div className="grid grid-cols-2 gap-2.5">
            <input required className={field} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required type="tel" className={field} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <label className="text-[10px] uppercase tracking-[0.14em] text-white/55">Check in<input type="date" className={`${field} mt-1`} value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} /></label>
            <label className="text-[10px] uppercase tracking-[0.14em] text-white/55">Check out<input type="date" className={`${field} mt-1`} value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} /></label>
          </div>
          <textarea rows={3} className={field} placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <button type="submit" className="tb-btn-ghost w-full justify-center">Compose enquiry email</button>
        </form>
        <p className="mt-4 text-center text-[11px] text-white/50">
          Prefer the website form? <a className="underline underline-offset-4 hover:text-white" href={CONTACT.contactUrl} target="_blank" rel="noopener noreferrer">Contact page</a>
        </p>
      </div>
    </div>
  );
}
