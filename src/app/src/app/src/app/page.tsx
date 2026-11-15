"use client";

import React, { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { MapPin, Share2, Volume2, VolumeX, CheckCircle2, Sparkles } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// CONFIGURAÇÃO DO LOCAL (Atualize quando tiver o endereço completo)
const CONFIG_EVENTO = {
  localNome: "Espaço de Festas da Neguinha",
  enderecoCompleto: "", // Ex: "Rua das Flores, 123 - Centro"
  linkMaps: "", // Opcional: cole aqui o link direto do Google Maps
};

export default function ConviteOtto() {
  const [etapa, setEtapa] = useState<"envelope" | "abertura" | "convite">("envelope");
  const [mutado, setMutado] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Estados do Formulário RSVP
  const [nome, setNome] = useState("");
  const [confirmado, setConfirmado] = useState<boolean | null>(null);
  const [adultos, setAdultos] = useState(1);
  const [criancas, setCriancas] = useState(0);
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [modoAtualizacao, setModoAtualizacao] = useState(false);
  const [erroForm, setErroForm] = useState("");

  const abrirConvite = () => {
    setEtapa("abertura");
    if (audioRef.current) {
      audioRef.current.volume = 0.45;
      audioRef.current.play().catch(() => {});
    }
    // Transição cinematográfica de 9 segundos para o convite principal
    setTimeout(() => {
      setEtapa((atual) => (atual === "abertura" ? "convite" : atual));
    }, 9000);
  };

  const pularParaConvite = () => {
    setEtapa("convite");
  };

  const alternarAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !mutado;
    setMutado(!mutado);
  };

  const normalizarNome = (texto: string) =>
    texto
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ");

  const verificarCadastroExistente = async (nomeDigitado: string) => {
    const norm = normalizarNome(nomeDigitado);
    if (norm.length < 4) return;

    const { data } = await supabase
      .from("rsvps")
      .select("*")
      .eq("nome_normalizado", norm)
      .maybeSingle();

    if (data) {
      setModoAtualizacao(true);
      setConfirmado(data.confirmado);
      setAdultos(data.adultos);
      setCriancas(data.criancas);
      setMensagem(data.mensagem || "");
    } else {
      setModoAtualizacao(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando) return;

    setErroForm("");
    if (nome.trim().length < 3) {
      setErroForm("Por favor, informe seu nome completo.");
      return;
    }
    if (confirmado === null) {
      setErroForm("Por favor, selecione SIM ou NÃO.");
      return;
    }

    setEnviando(true);
    const nomeNorm = normalizarNome(nome);

    const payload = {
      nome_completo: nome.trim(),
      nome_normalizado: nomeNorm,
      confirmado,
      adultos: confirmado ? Math.max(1, adultos) : 0,
      criancas: confirmado ? Math.max(0, criancas) : 0,
      mensagem: mensagem.trim() || null,
      atualizado_em: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("rsvps")
      .upsert(payload, { onConflict: "nome_normalizado" });

    setEnviando(false);

    if (error) {
      setErroForm("Ocorreu um erro ao salvar sua resposta. Tente novamente.");
    } else {
      setConcluido(true);
    }
  };

  const compartilharConvite = async () => {
    const url = window.location.href;
    const texto =
      "O Bosque está em festa! Você está convidado para o Chá de Bebê do Otto — 09 de janeiro de 2027, às 11h.";

    if (navigator.share) {
      try {
        await navigator.share({
          title: "CHÁ DE BEBÊ DO OTTO",
          text: texto,
          url,
        });
      } catch {}
    } else {
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(`${texto} ${url}`)}`,
        "_blank"
      );
    }
  };

  const abrirLocalizacao = () => {
    if (CONFIG_EVENTO.linkMaps) {
      window.open(CONFIG_EVENTO.linkMaps, "_blank");
      return;
    }
    const query = CONFIG_EVENTO.enderecoCompleto
      ? `${CONFIG_EVENTO.localNome}, ${CONFIG_EVENTO.enderecoCompleto}`
      : CONFIG_EVENTO.localNome;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
      "_blank"
    );
  };

  return (
    <main className="min-h-screen bg-marfim text-textoBosque font-corpo selection:bg-melSuave relative overflow-x-hidden">
      <audio ref={audioRef} src="/audio/bosque-instrumental.mp3" loop preload="none" />

      {etapa !== "envelope" && (
        <button
          onClick={alternarAudio}
          aria-label={mutado ? "Ativar música" : "Silenciar música"}
          className="fixed top-4 right-4 z-50 bg-marfim/90 border border-salvia/40 p-2.5 rounded-full shadow-md text-salviaEscuro hover:bg-bege transition"
        >
          {mutado ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      )}

      {/* ETAPA 1: ENVELOPE ILUSTRADO */}
      {etapa === "envelope" && (
        <section className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-marfim via-bege/60 to-marfim">
          <div
            onClick={abrirConvite}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && abrirConvite()}
            className="cursor-pointer group max-w-md w-full bg-[#FBF9F4] border-2 border-salvia/40 rounded-3xl p-10 shadow-[0_20px_50px_rgba(94,115,89,0.15)] transition-transform duration-500 hover:scale-[1.02]"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-mel/20 border-2 border-mel flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
              🍯
            </div>

            <p className="font-serifada tracking-[0.22em] text-xs uppercase text-salviaEscuro mb-3">
              Um convite especial para você
            </p>
            <h1 className="font-serifada text-3xl text-textoBosque italic mb-6">
              Chá de Bebê do Otto
            </h1>

            <span className="inline-block px-7 py-3 rounded-full bg-salvia text-white text-xs tracking-widest uppercase shadow-sm group-hover:bg-salviaEscuro transition">
              Toque para abrir
            </span>
          </div>
        </section>
      )}

      {/* ETAPA 2: CENA ANIMADA EM AQUARELA (9 SEGUNDOS COM PANORÂMICA SUAVE) */}
      {etapa === "abertura" && (
        <section className="fixed inset-0 z-40 bg-marfim flex flex-col items-center justify-center p-4 overflow-hidden">
          <div className="relative max-w-lg w-full h-[80vh] rounded-3xl overflow-hidden shadow-2xl border-2 border-salvia/40">
            <img
              src="/illustrations/arte-convite.jpg"
              alt="Turma do Ursinho Pooh no bosque em aquarela"
              className="w-full h-full object-cover animate-[pulse_9s_ease-in-out] scale-105 transition-transform duration-[9000ms]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-marfim via-transparent to-transparent flex flex-col justify-end p-8 text-center">
              <p className="font-serifada tracking-[0.25em] text-xs uppercase text-salviaEscuro font-bold">
                O Bosque está em festa!
              </p>
              <h2 className="font-serifada text-4xl text-textoBosque font-bold mt-1">
                OTTO
              </h2>
            </div>
          </div>

          <button
            onClick={pularParaConvite}
            className="fixed bottom-6 right-6 z-50 bg-marfim/90 border border-salvia/50 text-salviaEscuro px-5 py-2.5 rounded-full text-xs uppercase tracking-widest shadow hover:bg-marfim transition"
          >
            Pular abertura →
          </button>
        </section>
      )}

      {/* ETAPA 3: CONVITE PRINCIPAL + CONFIRMAÇÃO DE PRESENÇA */}
      {etapa === "convite" && (
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-10 animate-fadeIn">
          <section className="bg-[#FCFBF7] border border-salvia/40 rounded-3xl p-6 md:p-12 text-center shadow-[0_15px_45px_rgba(62,58,53,0.08)]">
            <img
              src="/illustrations/arte-convite.jpg"
              alt="Ilustração Chá de Bebê do Otto"
              className="w-full max-w-md mx-auto mb-8 rounded-2xl shadow-md border border-salvia/20"
            />

            <p className="font-serifada tracking-[0.25em] text-xs md:text-sm uppercase text-salviaEscuro font-semibold">
              O Bosque está em festa!
            </p>

            <p className="mt-4 text-base md:text-lg text-textoBosque/85 italic max-w-md mx-auto leading-relaxed">
              Um doce menino está chegando, e queremos dividir essa alegria com você!
            </p>

            <div className="my-7">
              <h1 className="font-serifada text-5xl md:text-6xl tracking-[0.15em] text-salviaEscuro font-semibold">
                OTTO
              </h1>
              <p className="font-serifada tracking-[0.3em] text-sm uppercase text-mel mt-2 font-semibold">
                Chá de Bebê
              </p>
            </div>

            <div className="border-y border-salvia/30 py-6 my-6 space-y-2">
              <p className="font-serifada text-xl md:text-2xl tracking-wide text-textoBosque">
                SÁBADO, 09 DE JANEIRO DE 2027 — 11H
              </p>
              <p className="text-sm md:text-base tracking-widest uppercase text-salviaEscuro font-medium">
                Espaço de Festas da Neguinha
              </p>
              {CONFIG_EVENTO.enderecoCompleto && (
                <p className="text-xs text-textoBosque/70">
                  {CONFIG_EVENTO.enderecoCompleto}
                </p>
              )}
            </div>

            <p className="italic text-textoBosque/80 text-sm md:text-base mb-8">
              Sua presença tornará esse dia ainda mais especial!
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={abrirLocalizacao}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-salvia text-white text-xs uppercase tracking-widest hover:bg-salviaEscuro transition shadow-sm"
              >
                <MapPin size={16} /> Como Chegar
              </button>
              <button
                onClick={compartilharConvite}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-salvia text-salviaEscuro text-xs uppercase tracking-widest hover:bg-bege/60 transition"
              >
                <Share2 size={16} /> Compartilhar Convite
              </button>
            </div>
          </section>

          {/* CONFIRMAÇÃO DE PRESENÇA */}
          <section
            id="confirmacao"
            className="bg-[#FCFBF7] border border-salvia/40 rounded-3xl p-8 md:p-12 shadow-[0_15px_45px_rgba(62,58,53,0.08)]"
          >
            <div className="text-center mb-8">
              <Sparkles className="w-6 h-6 text-mel mx-auto mb-2" />
              <h2 className="font-serifada text-2xl md:text-3xl text-salviaEscuro">
                Você vem comemorar com a gente?
              </h2>
              <p className="text-xs text-textoBosque/70 mt-1">
                Caso já tenha respondido e precise alterar algo, digite seu nome completo novamente.
              </p>
            </div>

            {concluido ? (
              <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-salvia mx-auto" />
                <h3 className="font-serifada text-2xl text-salviaEscuro">
                  {confirmado
                    ? `Que alegria, ${nome.split(" ")[0]}! Sua presença está confirmada.`
                    : `Agradecemos o carinho, ${nome.split(" ")[0]}!`}
                </h3>
                <p className="text-sm text-textoBosque/80 max-w-md mx-auto">
                  {confirmado
                    ? "O Ursinho Pooh e toda a turma do bosque já estão preparando os potes de mel para celebrar a chegada do Otto com você!"
                    : "Sentiremos sua falta no bosque, mas agradecemos imensamente por nos avisar."}
                </p>
                <button
                  onClick={() => setConcluido(false)}
                  className="mt-4 text-xs underline text-salviaEscuro hover:text-textoBosque"
                >
                  Alterar minha resposta
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-salviaEscuro mb-2">
                    Nome completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    onBlur={(e) => verificarCadastroExistente(e.target.value)}
                    placeholder="Ex: Maria Clara Oliveira"
                    className="w-full rounded-xl border border-salvia/40 bg-marfim/60 px-4 py-3 text-sm focus:outline-none focus:border-salviaEscuro"
                  />
                  {modoAtualizacao && (
                    <p className="text-xs text-mel mt-1.5 font-medium">
                      Encontramos uma confirmação anterior com este nome. Ao enviar, seus dados serão atualizados.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-salviaEscuro mb-2">
                    Você poderá comparecer? *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setConfirmado(true)}
                      className={`py-3 rounded-xl border text-sm font-medium transition ${
                        confirmado === true
                          ? "bg-salvia text-white border-salvia"
                          : "bg-marfim/50 border-salvia/40 text-textoBosque hover:bg-bege/50"
                      }`}
                    >
                      SIM, eu vou!
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmado(false)}
                      className={`py-3 rounded-xl border text-sm font-medium transition ${
                        confirmado === false
                          ? "bg-textoBosque text-white border-textoBosque"
                          : "bg-marfim/50 border-salvia/40 text-textoBosque hover:bg-bege/50"
                      }`}
                    >
                      NÃO poderei ir
                    </button>
                  </div>
                </div>

                {confirmado === true && (
                  <div className="grid grid-cols-2 gap-4 bg-bege/40 p-4 rounded-2xl border border-salvia/20">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-salviaEscuro mb-1.5">
                        Adultos (incluindo você)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={15}
                        value={adultos}
                        onChange={(e) => setAdultos(Number(e.target.value))}
                        className="w-full rounded-xl border border-salvia/40 bg-white px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-salviaEscuro mb-1.5">
                        Crianças
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={15}
                        value={criancas}
                        onChange={(e) => setCriancas(Number(e.target.value))}
                        className="w-full rounded-xl border border-salvia/40 bg-white px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs uppercase tracking-wider text-salviaEscuro mb-2">
                    Mensagem para o Otto e família (opcional)
                  </label>
                  <textarea
                    rows={3}
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Deixe um recadinho carinhoso..."
                    className="w-full rounded-xl border border-salvia/40 bg-marfim/60 px-4 py-3 text-sm focus:outline-none focus:border-salviaEscuro"
                  />
                </div>

                {erroForm && (
                  <p className="text-xs text-red-600 font-medium">{erroForm}</p>
                )}

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full py-3.5 rounded-full bg-mel text-textoBosque font-semibold text-xs uppercase tracking-[0.2em] shadow hover:bg-mel/90 transition disabled:opacity-50"
                >
                  {enviando
                    ? "Salvando..."
                    : modoAtualizacao
                    ? "Atualizar Confirmação"
                    : "Enviar Confirmação"}
                </button>
              </form>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
