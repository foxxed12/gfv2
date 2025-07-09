/* BirthdayGiftVika.tsx */
"use client";

import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Music2,
  Image as ImageIcon,
  Send,
  Camera,
  ScrollText,
  FileDown,
  Upload as UploadIcon,
} from "lucide-react";
import JSZip from "jszip";
import  saveAs  from "file-saver";
import clsx from "clsx";

/* ───────────── Helpers ───────────── */
const fileToDataURL = (file: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

/* ───────────── Static data ───────────── */
const initialAchievements = [
  { date: "2019", text: "Первый самостоятельный горный поход с друзьями." },
  { date: "2020", text: "Запустила блог #VikaTravels и поделилась 50 лайфхаков." },
  { date: "2021", text: "Приз на всероссийских соревнованиях по гребле." },
  { date: "2022", text: "Поступила на бюджет «Туризм»." },
  { date: "2023", text: "Практика в турагентстве «Кругозор» — 30 счастливых семей." },
  { date: "2024", text: "Диплом по family-wellness-tourism." },
  { date: "2025-07-09", text: "Тебе 20! Впереди новые горизонты 🚀" },
];

const topSongs = [];

/* ───────────── Gallery with auto-scroll ───────────── */
const LiveGallery: React.FC<{ images: string[] }> = ({ images }) => {
  const track = [...images, ...images];
  return (
    <div className="overflow-hidden rounded-xl">
      <motion.div
        className="flex gap-4"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 80, ease: "linear" }} // медленно
      >
        {track.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className="h-[36rem] w-auto rounded-xl object-cover" // x2 высота
          />
        ))}
      </motion.div>
    </div>
  );
};

/* ───────────── Guestbook ───────────── */
const Guestbook: React.FC<{ onAddPhoto: (p: string) => void }> = ({ onAddPhoto }) => {
  const [entries, setEntries] = useState<any[]>(() =>
    JSON.parse(localStorage.getItem("vika_guestbook") || "[]"),
  );
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim() || !msg.trim()) return;
    let photo: string | undefined;
    if (file) {
      photo = await fileToDataURL(file);
      onAddPhoto(photo);
    }
    const next = [...entries, { name: name.trim(), msg: msg.trim(), photo }];
    setEntries(next);
    localStorage.setItem("vika_guestbook", JSON.stringify(next));
    setName("");
    setMsg("");
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4 rounded-xl bg-white/70 p-6 shadow-lg backdrop-blur-md">
        <h3 className="text-center text-2xl font-semibold">Оставить пожелание</h3>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" />
        <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Пожелание" />
        {preview && (
          <img src={preview} className="max-h-60 w-full rounded-lg object-contain" alt="preview" />
        )}
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
          <ImageIcon className="h-4 w-4" /> Фото
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setFile(f);
                setPreview(URL.createObjectURL(f));
              }
            }}
          />
        </label>
        <Button onClick={submit} className="flex gap-2">
          <Send className="h-4 w-4" /> Отправить
        </Button>
      </div>

      {entries
        .slice()
        .reverse()
        .map((e, i) => (
          <div key={i} className="rounded-xl bg-white/60 p-4 shadow-md backdrop-blur-md">
            <p className="font-semibold">{e.name}</p>
            <p className="whitespace-pre-line">{e.msg}</p>
            {e.photo && (
              <img src={e.photo} alt="guest" className="mt-2 max-h-60 rounded-lg object-contain" />
            )}
          </div>
        ))}
    </div>
  );
};

/* ───────────── Main ───────────── */
export default function BirthdayGiftVika() {
  /* gallery */
  const [gallery, setGallery] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem("vika_gallery") || "[]").length
      ? JSON.parse(localStorage.getItem("vika_gallery") || "[]")
      : [],
  );

  /* achievements */
  const [achievements, setAch] = useState<typeof initialAchievements>(() =>
    JSON.parse(localStorage.getItem("vika_ach") || "[]").length
      ? JSON.parse(localStorage.getItem("vika_ach") || "[]")
      : initialAchievements,
  );

  /* audio */
  const [tracks, setTracks] = useState<typeof topSongs>(() => topSongs);
  const [current, setCurrent] = useState<number | null>(null);

  /* localStorage sync */
  useEffect(() => localStorage.setItem("vika_gallery", JSON.stringify(gallery)), [gallery]);
  useEffect(() => localStorage.setItem("vika_ach", JSON.stringify(achievements)), [achievements]);

  /* viewport */
  const [vp, setVp] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const handler = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  /* quick-adds */
  // quick-add фото
  const addPhotoQuick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const photo = await fileToDataURL(f);      // <-- сперва превращаем в data-URL
    setGallery((g) => [...g, photo]);          // затем синхронно обновляем state
  };
  
  // quick-add аудио
  const addAudioQuick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const audio = await fileToDataURL(f);
    setTracks((t) => [...t, { title: f.name, artist: "User Upload", url: audio }]);
  };


  const addAchievementQuick = () => {
    const date = prompt("Год / дата достижения:");
    if (!date) return;
    const text = prompt("Опишите достижение:");
    if (text) setAch((a) => [...a, { date: date.trim(), text: text.trim() }]);
  };

  /* download ZIP */
  const downloadAll = async () => {
    const zip = new JSZip();
    zip.file("achievements.json", JSON.stringify(achievements, null, 2));
    zip.file("gallery.json", JSON.stringify(gallery, null, 2));
    zip.file("tracks.json", JSON.stringify(tracks, null, 2));
    zip.file("guestbook.json", localStorage.getItem("vika_guestbook") || "[]");
    gallery.forEach((src, i) => {
      if (src.startsWith("data:")) {
        const [, meta, base64] = src.match(/^data:(.*?);base64,(.+)$/) || [];
        if (!meta || !base64) return;
        zip.file(`images/img_${i}.${(meta.split("/")[1] || "png")}`, base64, { base64: true });
      }
    });
    tracks.forEach((t, i) => {
      if (t.url.startsWith("data:")) {
        const [, meta, base64] = t.url.match(/^data:(.*?);base64,(.+)$/) || [];
        if (!meta || !base64) return;
        zip.file(`audio/audio_${i}.${(meta.split("/")[1] || "mp3")}`, base64, { base64: true });
      }
    });
    saveAs(await zip.generateAsync({ type: "blob" }), "BirthdayGiftVika.zip");
  };

  /* responsive cols for achievements */
  const cols = vp.w >= 1280 ? 3 : vp.w >= 768 ? 2 : 1;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-pink-50 to-indigo-50">
      <Confetti width={vp.w} height={vp.h} numberOfPieces={250} recycle={false} />
      {/* content container */}
      <div className="mx-auto max-w-7xl space-y-16 px-4 py-12">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center text-4xl font-extrabold drop-shadow-sm"
        >
          С Днём рождения, Вика 🎂
        </motion.h1>

        {/* Achievements */}
        <section id="achievements" className="space-y-4">
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <ScrollText className="h-6 w-6" /> Достижения
          </h2>
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {achievements
              .slice()
              .sort(
                (a, b) => new Date(a.date).valueOf() - new Date(b.date).valueOf(),
              )
              .map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ rotate: -1.5 }}
                  animate={{ rotate: [-1.5, 1.5, -1.5] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Card className="shadow-md">
                    <CardContent className="py-4">
                      <span className="font-bold">{a.date}:</span> {a.text}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>
        </section>

        {/* Gallery */}
        <section id="gallery" className="space-y-4">
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <Camera className="h-6 w-6" /> Моменты
          </h2>
          <LiveGallery images={gallery} />
        </section>

        {/* Music */}
        <section id="music" className="space-y-4">
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <Music2 className="h-6 w-6" /> Треки
          </h2>
          <div className="space-y-6">
            {tracks.map((t, i) => (
              <Card
                key={i}
                className={clsx(
                  "shadow-md transition",
                  current === i && "ring-4 ring-pink-400 animate-pulse",
                )}
              >
                <CardContent className="flex flex-col gap-3 py-4">
                  <p className="text-sm font-semibold">
                    {t.artist} — {t.title}
                  </p>
                  <audio
                    controls
                    onPlay={() => setCurrent(i)}
                    onPause={() => setCurrent((c) => (c === i ? null : c))}
                    src={t.url}
                    className="w-full rounded-xl accent-pink-600 outline-none"
                    preload="none"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Guestbook */}
        <section id="guestbook" className="space-y-4">
          <Guestbook onAddPhoto={(p) => setGallery((g) => [...g, p])} />
        </section>
      </div>

      {/* FABs */}
      <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-4">
        {/* upload photo */}
        <label className="relative">
          <button className="rounded-full bg-indigo-600 p-3 text-white shadow-xl transition hover:scale-105 active:scale-95">
            <ImageIcon className="h-5 w-5" />
          </button>
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={addPhotoQuick}
          />
        </label>

        {/* upload audio */}
        <label className="relative">
          <button className="rounded-full bg-teal-600 p-3 text-white shadow-xl transition hover:scale-105 active:scale-95">
            <UploadIcon className="h-5 w-5" />
          </button>
          <input
            type="file"
            accept="audio/*"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={addAudioQuick}
          />
        </label>

        {/* add achievement */}
        <button
          onClick={addAchievementQuick}
          className="rounded-full bg-green-600 p-3 text-white shadow-xl transition hover:scale-105 active:scale-95"
        >
          <ScrollText className="h-5 w-5" />
        </button>

        {/* download */}
        <button
          onClick={downloadAll}
          className="rounded-full bg-gray-700 p-3 text-white shadow-xl transition hover:scale-105 active:scale-95"
        >
          <FileDown className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
