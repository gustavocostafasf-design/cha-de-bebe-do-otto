"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Download, LogOut, Users, UserCheck, UserX, Baby } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PainelAdmin() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erroLogin, setErroLogin] = useState("");
  const [rsvps, setRsvps] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) carregarDados();
    });
  }, []);

  const carregarDados = async () => {
    const { data } = await supabase
      .from("rsvps")
      .select("*")
      .order("atualizado_em", { ascending: false });
    setRsvps(data || []);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroLogin("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErroLogin("E-mail ou senha inválidos.");
    } else {
      setSession(data.session);
      carregarDados();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const exportarExcelCSV = () => {
    const cabecalho = [
      "Nome Completo",
      "Status",
      "Adultos",
      "Crianças",
      "Mensagem",
      "Data/Hora Atualização",
    ];

    const linhas = rsvps.map((r) => [
      `"${r.nome_completo.replace(/"/g, '""')}"`,
      r.confirmado ? "CONFIRMADO" : "NÃO VAI",
      r.adultos,
      r.criancas,
      `"${(r.mensagem || "").replace(/"/g, '""')}"`,
      new Date(r.atualizado_em).toLocaleString("pt-BR"),
    ]);

    const csvConteudo =
      "\uFEFF" + [cabecalho.join(";"), ...linhas.map((l) => l.join(";"))].join("\n");

    const blob = new Blob([csvConteudo], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lista-cha-do-otto-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  if (!session) {
    return (
      <main className="min-h-screen bg-marfim flex items-center justify-center p-6">
        <form
          onSubmit={handleLogin}
          className="bg-white border border-salvia/40 rounded-3xl p-8 max-w-sm w-full shadow-lg space-y-5"
        >
          <h1 className="font-serifada text-2xl text-center text-salviaEscuro">
            Painel Administrativo — Otto
          </h1>
          <input
            type="email"
            required
            placeholder="E-mail do administrador"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-salvia/40 rounded-xl px-4 py-2.5 text-sm"
          />
          <input
            type="password"
            required
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-salvia/40 rounded-xl px-4 py-2.5 text-sm"
          />
          {erroLogin && <p className="text-xs text-red-600">{erroLogin}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-full bg-salvia text-white text-xs uppercase tracking-widest hover:bg-salviaEscuro"
          >
            Entrar
          </button>
        </form>
      </main>
    );
  }

  const confirmados = rsvps.filter((r) => r.confirmado);
  const recusas = rsvps.filter((r) => !r.confirmado);
  const totalAdultos = confirmados.reduce((acc, r) => acc + (r.adultos || 0), 0);
  const totalCriancas = confirmados.reduce((acc, r) => acc + (r.criancas || 0), 0);

  return (
    <main className="min-h-screen bg-marfim text-textoBosque p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-salvia/30 pb-6">
          <div>
            <h1 className="font-serifada text-3xl text-salviaEscuro">
              Chá de Bebê do Otto — Gestão
            </h1>
            <p className="text-xs text-textoBosque/70">
              09 de Janeiro de 2027 • Espaço de Festas da Neguinha
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportarExcelCSV}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-salvia text-white text-xs uppercase tracking-wider hover:bg-salviaEscuro"
            >
              <Download size={16} /> Exportar Excel (CSV)
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-salvia/50 text-xs uppercase tracking-wider hover:bg-bege"
            >
              <LogOut size={16} /> Sair
            </button>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-salvia/30">
            <UserCheck className="text-salvia mb-2" size={20} />
            <p className="text-2xl font-bold">{confirmados.length}</p>
            <p className="text-xs text-textoBosque/70">Respostas SIM</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-salvia/30">
            <Users className="text-salviaEscuro mb-2" size={20} />
            <p className="text-2xl font-bold">{totalAdultos}</p>
            <p className="text-xs text-textoBosque/70">Total Adultos</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-salvia/30">
            <Baby className="text-mel mb-2" size={20} />
            <p className="text-2xl font-bold">{totalCriancas}</p>
            <p className="text-xs text-textoBosque/70">Total Crianças</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-salvia/30">
            <UserX className="text-red-500 mb-2" size={20} />
            <p className="text-2xl font-bold">{recusas.length}</p>
            <p className="text-xs text-textoBosque/70">Recusas (NÃO)</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-salvia/30 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-bege/60 text-xs uppercase text-salviaEscuro">
                <tr>
                  <th className="p-4">Convidado</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Adultos</th>
                  <th className="p-4">Crianças</th>
                  <th className="p-4">Mensagem</th>
                  <th className="p-4">Data/Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-salvia/20">
                {rsvps.map((item) => (
                  <tr key={item.id} className="hover:bg-marfim/50">
                    <td className="p-4 font-medium">{item.nome_completo}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.confirmado
                            ? "bg-salvia/20 text-salviaEscuro"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.confirmado ? "Confirmado" : "Não vai"}
                      </span>
                    </td>
                    <td className="p-4">{item.adultos}</td>
                    <td className="p-4">{item.criancas}</td>
                    <td className="p-4 max-w-xs text-textoBosque/80 italic">
                      {item.mensagem || "—"}
                    </td>
                    <td className="p-4 text-xs text-textoBosque/60">
                      {new Date(item.atualizado_em).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
