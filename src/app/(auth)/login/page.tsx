import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <section className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">VetFiscal OS</h1>
            <p className="text-sm text-muted-foreground">Acesso operacional</p>
          </div>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          A sessao server-side com Supabase Auth ja esta preparada. Login, logout e troca de tenant entram na proxima etapa,
          sem acoplar regras fiscais a interface.
        </p>
      </section>
    </main>
  );
}
