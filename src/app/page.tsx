import {
  AlertTriangle,
  BookOpen,
  Bot,
  CheckCircle2,
  Database,
  FileJson,
  FlaskConical,
  GraduationCap,
  Layers3,
  NotebookPen,
  ShieldCheck,
} from "lucide-react";
import { getAgentContext, parseResources } from "@/lib/learning";

export const dynamic = "force-dynamic";

const statusMeta: Record<string, { label: string; className: string }> = {
  NOT_STARTED: {
    label: "Pendiente",
    className: "border-zinc-200 bg-zinc-50 text-zinc-700",
  },
  IN_PROGRESS: {
    label: "En progreso",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  COMPLETED: {
    label: "Completada",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  BLOCKED: {
    label: "Bloqueada",
    className: "border-red-200 bg-red-50 text-red-800",
  },
};

function statusPill(status?: string | null) {
  const meta = statusMeta[status ?? "NOT_STARTED"] ?? statusMeta.NOT_STARTED;

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

export default async function Home() {
  const context = await getAgentContext();
  const course = context.courses[0];
  const completion = context.stats.completionRate;
  const firstPending = context.nextLessons[0];
  const firstResources = parseResources(firstPending?.resources);

  return (
    <main className="min-h-screen bg-[#f7f8f3] text-[#191a13]">
      <section className="border-b border-[#27291f] bg-[#111313] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[1.5fr_1fr] lg:px-8">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-[#f3ba2f]/40 bg-[#f3ba2f]/10 px-3 py-1 text-sm font-medium text-[#f3ba2f]">
                <GraduationCap size={16} />
                Binance Learning
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                Arbitraje educativo en Binance
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
                {course?.description}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <BookOpen size={16} />
                  Clases
                </div>
                <p className="mt-2 text-3xl font-semibold">
                  {context.stats.completedLessons}/{context.stats.totalLessons}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <FlaskConical size={16} />
                  Practicas
                </div>
                <p className="mt-2 text-3xl font-semibold">
                  {course?.modules.reduce(
                    (count, module) =>
                      count + module.lessons.filter((lesson) => lesson.type === "PRACTICE").length,
                    0,
                  ) ?? 0}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center gap-2 text-sm text-zinc-300">
                  <ShieldCheck size={16} />
                  Modo
                </div>
                <p className="mt-2 text-2xl font-semibold text-[#f3ba2f]">Simulacion</p>
              </div>
            </div>
          </div>

          <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-400">Aprendiz</p>
                <h2 className="text-2xl font-semibold">{context.learner.name}</h2>
              </div>
              <Bot className="text-[#f3ba2f]" size={32} />
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-zinc-300">Avance total</span>
                <span className="font-medium text-white">{completion}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-md bg-white/10">
                <div className="h-full bg-[#f3ba2f]" style={{ width: `${completion}%` }} />
              </div>
            </div>

            {firstPending ? (
              <div className="mt-6 rounded-lg border border-[#f3ba2f]/25 bg-[#f3ba2f]/10 p-4">
                <p className="text-sm font-medium text-[#f3ba2f]">Siguiente clase</p>
                <h3 className="mt-2 text-lg font-semibold">{firstPending.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-300">{firstPending.objective}</p>
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="space-y-5">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                  <Layers3 size={16} />
                  Ruta principal
                </div>
                <h2 className="mt-2 text-2xl font-semibold">{course?.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">{course?.goal}</p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800 sm:max-w-sm">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle size={16} />
                  Riesgo
                </div>
                <p className="mt-1">{course?.riskNotice}</p>
              </div>
            </div>
          </div>

          {course?.modules.map((module) => (
            <section key={module.id} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-[#8a6514]">Modulo {module.sortOrder}</p>
                  <h3 className="text-xl font-semibold">{module.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">{module.summary}</p>
                </div>
              </div>

              <div className="grid gap-3">
                {module.lessons.map((lesson) => {
                  const progress = lesson.progress[0];

                  return (
                    <article
                      key={lesson.id}
                      className="rounded-lg border border-zinc-200 bg-[#fbfbf7] p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            {statusPill(progress?.status)}
                            <span className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-600">
                              {lesson.type === "PRACTICE" ? "Practica" : "Teoria"}
                            </span>
                            <span className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-600">
                              {lesson.durationMinutes} min
                            </span>
                          </div>
                          <h4 className="mt-3 text-lg font-semibold">{lesson.title}</h4>
                          <p className="mt-2 text-sm leading-6 text-zinc-600">{lesson.objective}</p>
                        </div>
                        {progress?.score != null ? (
                          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-emerald-800">
                            <p className="text-xs font-medium">Score</p>
                            <p className="text-xl font-semibold">{progress.score}</p>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <aside className="space-y-5">
          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Database size={18} className="text-[#8a6514]" />
              <h2 className="text-lg font-semibold">Source del agente</h2>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {[
                ["GET", "/api/agent/context"],
                ["POST", "/api/agent/progress"],
                ["POST", "/api/agent/content"],
                ["POST", "/api/agent/notes"],
              ].map(([method, path]) => (
                <div
                  key={path}
                  className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-[#fbfbf7] px-3 py-2"
                >
                  <span className="rounded-md bg-[#111313] px-2 py-1 text-xs font-semibold text-white">
                    {method}
                  </span>
                  <code className="truncate text-xs text-zinc-700">{path}</code>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <NotebookPen size={18} className="text-[#8a6514]" />
              <h2 className="text-lg font-semibold">Notas recientes</h2>
            </div>
            <div className="mt-4 space-y-3">
              {context.notes.slice(0, 3).map((note) => (
                <article key={note.id} className="rounded-lg border border-zinc-200 bg-[#fbfbf7] p-3">
                  <p className="text-xs font-semibold uppercase text-zinc-500">{note.scope}</p>
                  <h3 className="mt-1 font-semibold">{note.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{note.content}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <FileJson size={18} className="text-[#8a6514]" />
              <h2 className="text-lg font-semibold">Recursos base</h2>
            </div>
            <ul className="mt-4 space-y-2">
              {firstResources.map((resource) => (
                <li key={resource} className="flex gap-2 text-sm leading-6 text-zinc-600">
                  <CheckCircle2 className="mt-1 text-emerald-600" size={15} />
                  <span>{resource}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </section>
    </main>
  );
}
