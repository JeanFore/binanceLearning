import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const lessonResources = [
  "Simulacion local: no ejecutar ordenes reales.",
  "Registrar comisiones, slippage, latencia y profundidad antes de estimar margen.",
  "Usar datos ficticios o paper trading hasta validar el flujo completo.",
];

async function main() {
  const learner = await prisma.learner.upsert({
    where: { email: "agent@local.dev" },
    update: {},
    create: {
      name: "Agente aprendiz",
      email: "agent@local.dev",
    },
  });

  const course = await prisma.course.upsert({
    where: { slug: "binance-arbitraje-fundamentos" },
    update: {
      title: "Binance Learning: arbitraje controlado",
      description:
        "Ruta practica para estudiar arbitraje cripto con enfoque educativo, gestion de riesgo y simulacion antes de operar.",
      goal:
        "Construir criterio para detectar, documentar y evaluar oportunidades de arbitraje sin automatizar dinero real.",
      riskNotice:
        "Contenido educativo. No es recomendacion financiera. El arbitraje real puede perder dinero por comisiones, slippage, latencia, retiros pausados, liquidez baja y fallos operativos.",
    },
    create: {
      slug: "binance-arbitraje-fundamentos",
      title: "Binance Learning: arbitraje controlado",
      description:
        "Ruta practica para estudiar arbitraje cripto con enfoque educativo, gestion de riesgo y simulacion antes de operar.",
      goal:
        "Construir criterio para detectar, documentar y evaluar oportunidades de arbitraje sin automatizar dinero real.",
      riskNotice:
        "Contenido educativo. No es recomendacion financiera. El arbitraje real puede perder dinero por comisiones, slippage, latencia, retiros pausados, liquidez baja y fallos operativos.",
      sortOrder: 1,
    },
  });

  const modules = [
    {
      title: "Fundamentos y riesgos",
      summary:
        "Conceptos base, limites reales del arbitraje y checklist de seguridad antes de pensar en automatizacion.",
      sortOrder: 1,
      lessons: [
        {
          title: "Que es arbitraje y cuando no existe oportunidad",
          type: "THEORY",
          difficulty: "BEGINNER",
          durationMinutes: 18,
          objective:
            "Distinguir spread visible de ganancia neta despues de costos y restricciones operativas.",
          content:
            "El arbitraje busca comprar un activo donde esta mas barato y venderlo donde esta mas caro. En cripto, la diferencia bruta casi nunca basta: debes descontar comisiones maker/taker, spread bid/ask, slippage, latencia, limite minimo de orden, profundidad disponible y riesgo de transferencia. Una oportunidad solo existe si el margen neto sigue siendo positivo despues de esos factores y si ambas piernas pueden ejecutarse con control.",
          successCriteria:
            "Explica en tus palabras por que un spread del 0.30% puede terminar en perdida.",
        },
        {
          title: "Mapa de riesgos operativos en Binance",
          type: "THEORY",
          difficulty: "BEGINNER",
          durationMinutes: 22,
          objective:
            "Identificar riesgos que bloquean o degradan una operacion de arbitraje.",
          content:
            "Los riesgos principales son: liquidez insuficiente, cambios rapidos del order book, comisiones no consideradas, retiros o depositos suspendidos, pares con baja profundidad, min notional, precision de cantidad/precio y errores de reconciliacion. El aprendizaje debe registrar cada riesgo como una hipotesis comprobable antes de escribir cualquier bot.",
          successCriteria:
            "Crea una lista de verificacion de 7 puntos para validar una operacion simulada.",
        },
      ],
    },
    {
      title: "Datos y calculo",
      summary:
        "Lectura de precios, profundidad y calculo neto de oportunidades con datos controlados.",
      sortOrder: 2,
      lessons: [
        {
          title: "Order book, ticker y profundidad",
          type: "THEORY",
          difficulty: "BEGINNER",
          durationMinutes: 25,
          objective:
            "Leer bid, ask, volumen y profundidad suficiente para estimar precio ejecutable.",
          content:
            "El ultimo precio no garantiza ejecucion. Para arbitraje se observa el ask donde compras, el bid donde vendes y el volumen disponible en cada nivel. Si el tamano de la orden consume varios niveles, el precio promedio empeora. La oportunidad debe calcularse con precio promedio ponderado y no con el primer nivel aislado.",
          successCriteria:
            "Calcula el precio promedio de compra usando tres niveles ficticios de ask.",
        },
        {
          title: "Calculadora manual de margen neto",
          type: "PRACTICE",
          difficulty: "INTERMEDIATE",
          durationMinutes: 35,
          objective:
            "Construir una formula simple para margen neto con comisiones y slippage.",
          content:
            "Formula sugerida: margen_neto = ingreso_venta - costo_compra - comisiones - slippage_estimado - costo_transferencia. La decision no se basa en porcentaje bruto sino en ganancia neta esperada frente al riesgo y al tiempo de exposicion.",
          practicePrompt:
            "Usa buyAsk=100.00, sellBid=100.55, cantidad=10, fee=0.10% por pierna y slippage estimado=0.15%. Calcula el resultado neto y registra si operarias en simulacion.",
          successCriteria:
            "Entrega calculo, supuestos y decision final con una razon concreta.",
        },
      ],
    },
    {
      title: "Practica simulada",
      summary:
        "Ejercicios de paper trading, bitacora de hipotesis y evaluacion de resultados.",
      sortOrder: 3,
      lessons: [
        {
          title: "Backtest pequeno con precios ficticios",
          type: "PRACTICE",
          difficulty: "INTERMEDIATE",
          durationMinutes: 45,
          objective:
            "Evaluar una regla de entrada/salida con datos historicos simulados.",
          content:
            "Un backtest educativo debe separar senal, ejecucion y resultado. La senal detecta spread neto; la ejecucion estima llenado parcial y slippage; el resultado registra ganancia o perdida. No optimices parametros hasta que el registro sea consistente.",
          practicePrompt:
            "Crea 10 filas de precios ficticios con buyAsk, sellBid, volumen y fee. Marca en cuales filas la oportunidad supera 0.20% neto.",
          successCriteria:
            "Presenta la tabla y justifica por que algunas senales se descartan.",
        },
        {
          title: "Bitacora de aprendizaje para el agente",
          type: "PRACTICE",
          difficulty: "BEGINNER",
          durationMinutes: 30,
          objective:
            "Registrar avances, dudas y contenido nuevo que el agente debe consultar despues.",
          content:
            "Cada sesion debe dejar una evidencia: leccion estudiada, calculo realizado, error encontrado, decision tomada y siguiente paso. Esa bitacora hace que el agente no repita contexto y pueda escribir contenido complementario cuando detecte vacios.",
          practicePrompt:
            "Escribe una nota con: avance de hoy, principal riesgo entendido, duda abierta y siguiente practica.",
          successCriteria:
            "La nota permite continuar la siguiente sesion sin explicaciones adicionales.",
        },
      ],
    },
    {
      title: "Flujo agente y control",
      summary:
        "Endpoints, criterios de avance y reglas para mantener el sistema en modo aprendizaje.",
      sortOrder: 4,
      lessons: [
        {
          title: "Contrato API para consultar progreso",
          type: "THEORY",
          difficulty: "INTERMEDIATE",
          durationMinutes: 20,
          objective:
            "Entender como un agente externo lee contexto y decide la siguiente clase.",
          content:
            "El agente debe consultar catalogo, progreso, notas y contenido generado antes de proponer la siguiente actividad. Las escrituras deben ser explicitas: progreso, nota o borrador de contenido. Evita mezclar senales de trading con ejecucion real dentro del mismo contrato.",
          successCriteria:
            "Describe que endpoint usaria el agente para leer contexto y cual para guardar avance.",
        },
        {
          title: "Checklist antes de cualquier operacion real",
          type: "PRACTICE",
          difficulty: "ADVANCED",
          durationMinutes: 40,
          objective:
            "Definir una barrera educativa antes de pasar de simulacion a dinero real.",
          content:
            "Antes de operar real debe existir historial de paper trading, control de perdidas, monitoreo de errores, limites de tamano, revision de comisiones y pruebas de recuperacion. Esta app no ejecuta ordenes; solo organiza aprendizaje y evidencia.",
          practicePrompt:
            "Redacta una politica de no-operacion real: condiciones que deben cumplirse y senales que obligan a detener el experimento.",
          successCriteria:
            "La politica incluye limites de capital, fallos que detienen el bot y responsable de revision.",
        },
      ],
    },
  ];

  for (const moduleData of modules) {
    const learningModule = await prisma.module.upsert({
      where: {
        id: `${course.slug}-${moduleData.sortOrder}`,
      },
      update: {
        title: moduleData.title,
        summary: moduleData.summary,
        sortOrder: moduleData.sortOrder,
      },
      create: {
        id: `${course.slug}-${moduleData.sortOrder}`,
        courseId: course.id,
        title: moduleData.title,
        summary: moduleData.summary,
        sortOrder: moduleData.sortOrder,
      },
    });

    for (const [index, lessonData] of moduleData.lessons.entries()) {
      const lessonId = `${learningModule.id}-lesson-${index + 1}`;
      await prisma.lesson.upsert({
        where: { id: lessonId },
        update: {
          ...lessonData,
          sortOrder: index + 1,
          resources: JSON.stringify(lessonResources),
        },
        create: {
          id: lessonId,
          moduleId: learningModule.id,
          ...lessonData,
          sortOrder: index + 1,
          resources: JSON.stringify(lessonResources),
        },
      });
    }
  }

  const firstLesson = await prisma.lesson.findFirst({
    orderBy: [{ module: { sortOrder: "asc" } }, { sortOrder: "asc" }],
  });

  if (firstLesson) {
    await prisma.lessonProgress.upsert({
      where: {
        learnerId_lessonId: {
          learnerId: learner.id,
          lessonId: firstLesson.id,
        },
      },
      update: {
        status: "IN_PROGRESS",
        score: null,
        reflection:
          "Inicio del plan. El agente debe priorizar fundamentos antes de ejercicios practicos.",
        lastArtifact: null,
        completedAt: null,
      },
      create: {
        learnerId: learner.id,
        lessonId: firstLesson.id,
        status: "IN_PROGRESS",
        reflection:
          "Inicio del plan. El agente debe priorizar fundamentos antes de ejercicios practicos.",
      },
    });
  }

  await prisma.agentNote.upsert({
    where: { id: "seed-note-learning-guardrails" },
    update: {
      title: "Regla base del agente",
      content:
        "Mantener todo en modo educativo y simulacion. No sugerir ejecucion con capital real sin evidencia previa, limites y aprobacion humana.",
    },
    create: {
      id: "seed-note-learning-guardrails",
      learnerId: learner.id,
      scope: "SAFETY",
      title: "Regla base del agente",
      content:
        "Mantener todo en modo educativo y simulacion. No sugerir ejecucion con capital real sin evidencia previa, limites y aprobacion humana.",
      createdBy: "seed",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
