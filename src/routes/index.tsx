import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CRM Comercial — Leads" },
      { name: "description", content: "Gerencie seus leads e etapas de venda em tempo real." },
      { property: "og:title", content: "CRM Comercial — Leads" },
      { property: "og:description", content: "Gerencie seus leads e etapas de venda em tempo real." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:wght@500;700&family=Manrope:wght@400;500;700&display=swap",
      },
    ],
  }),
  component: Index,
});

type Lead = {
  id: number;
  created_at: string;
  nome: string | null;
  empresa: string | null;
  valor: number | null;
  etapa: string | null;
};

const ETAPAS = ["Novo", "Em contato", "Fechado"] as const;
const stageClass: Record<string, string> = {
  Novo: "bg-stage-new",
  "Em contato": "bg-stage-contact",
  Fechado: "bg-stage-closed",
};

const brl = (v: number | null) =>
  (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Index() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<string>("Todos");

  const load = async () => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error("Erro ao carregar leads: " + error.message);
    else setLeads(data as Lead[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`leads-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const mudarEtapa = async (id: number, etapa: string) => {
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, etapa } : l)));
    const { error } = await supabase.from("leads").update({ etapa }).eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar: " + error.message);
      load();
    }
  };

  const visiveis = filtro === "Todos" ? leads : leads.filter((l) => l.etapa === filtro);
  const totais = useMemo(
    () =>
      ETAPAS.map((e) => ({
        etapa: e,
        qtd: leads.filter((l) => l.etapa === e).length,
        soma: leads.filter((l) => l.etapa === e).reduce((s, l) => s + (l.valor ?? 0), 0),
      })),
    [leads],
  );

  return (
    <div className="min-h-screen">
      <Toaster />
      <header className="border-b bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-5 py-8">
          <p className="text-sm uppercase tracking-widest opacity-70">CRM Comercial</p>
          <h1 className="mt-1 text-4xl font-bold">Pipeline de leads</h1>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[340px_1fr]">
        <LeadForm onCreated={load} />

        <section>
          <div className="mb-5 grid grid-cols-3 gap-3">
            {totais.map((t) => (
              <div key={t.etapa} className="rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={`h-2 w-2 rounded-full ${stageClass[t.etapa]}`} />
                  {t.etapa}
                </div>
                <div className="mt-1 font-display text-xl font-bold">{t.qtd}</div>
                <div className="text-xs text-muted-foreground">{brl(t.soma)}</div>
              </div>
            ))}
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {["Todos", ...ETAPAS].map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filtro === f ? "default" : "outline"}
                onClick={() => setFiltro(f)}
              >
                {f}
              </Button>
            ))}
          </div>

          {loading ? (
            <p className="text-muted-foreground">Carregando…</p>
          ) : visiveis.length === 0 ? (
            <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              Nenhum lead por aqui ainda.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {visiveis.map((l) => (
                <li key={l.id} className="rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold">{l.nome}</h3>
                      <p className="truncate text-sm text-muted-foreground">{l.empresa || "—"}</p>
                    </div>
                    <span className="font-display text-lg font-bold text-primary">{brl(l.valor)}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
                    {ETAPAS.map((e) => (
                      <button
                        key={e}
                        onClick={() => mudarEtapa(l.id, e)}
                        className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition ${
                          l.etapa === e ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${stageClass[e]}`} />
                        {e}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

function LeadForm({ onCreated }: { onCreated: () => void }) {
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [valor, setValor] = useState("");
  const [etapa, setEtapa] = useState<string>("Novo");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) { toast.error("Informe o nome"); return; }
    setSaving(true);
    const { error } = await supabase.from("leads").insert({
      nome: nome.trim(),
      empresa: empresa.trim() || null,
      valor: valor ? Number(valor) : null,
      etapa,
    });
    setSaving(false);
    if (error) { toast.error("Erro ao salvar: " + error.message); return; }
    toast.success("Lead adicionado");
    setNome(""); setEmpresa(""); setValor(""); setEtapa("Novo");
    onCreated();
  };

  return (
    <form onSubmit={submit} className="h-fit space-y-4 rounded-xl border bg-card p-5 lg:sticky lg:top-6">
      <h2 className="text-2xl font-bold">Novo lead</h2>
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" maxLength={120} value={nome} onChange={(e) => setNome(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="empresa">Empresa</Label>
        <Input id="empresa" maxLength={120} value={empresa} onChange={(e) => setEmpresa(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="valor">Valor (R$)</Label>
        <Input id="valor" type="number" min={0} step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Etapa</Label>
        <div className="flex gap-1">
          {ETAPAS.map((e) => (
            <Button key={e} type="button" size="sm" variant={etapa === e ? "default" : "outline"} onClick={() => setEtapa(e)}>
              {e}
            </Button>
          ))}
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "Salvando…" : "Adicionar lead"}
      </Button>
    </form>
  );
}
