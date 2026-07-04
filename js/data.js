// js/data.js

const ACTIONS = [
  {
    id: "bike",
    title: "Andar de Bicicleta",
    description: "Pedalar para o trabalho ou lazer em vez de usar carro",
    points: 50,
    co2: 0.5, // kg
    icon: "bike",
    category: "transport"
  },
  {
    id: "bus",
    title: "Transporte Público",
    description: "Usar ônibus, metrô ou trem para locomoção",
    points: 30,
    co2: 0.3,
    icon: "bus",
    category: "transport"
  },
  {
    id: "recycle",
    title: "Reciclagem",
    description: "Separar resíduos secos, plásticos e metais corretamente",
    points: 20,
    co2: 0.2,
    icon: "recycle",
    category: "waste"
  },
  {
    id: "ecobag",
    title: "Uso de Ecobag",
    description: "Utilizar sacolas retornáveis e recusar sacolas plásticas",
    points: 15,
    co2: 0.15,
    icon: "shopping-bag",
    category: "waste"
  },
  {
    id: "tree",
    title: "Plantou Árvore",
    description: "Plantar uma árvore ou adotar uma muda nativa",
    points: 100,
    co2: 1.0,
    icon: "sprout",
    category: "nature"
  },
  {
    id: "energy",
    title: "Economizar Energia",
    description: "Reduzir consumo elétrico (desligar aparelhos, banho rápido)",
    points: 40,
    co2: 0.4,
    icon: "zap",
    category: "energy"
  }
];

const REWARDS = [
  {
    id: "mcdonalds-casquinha",
    name: "Casquinha Sustentável",
    company: "McDonald's",
    points: 200,
    category: "Alimentação",
    esgBadge: "Embalagem Reciclável",
    description: "Resgate uma casquinha de sorvete grátis em qualquer restaurante participante. O McDonald's apoia metas globais de uso de embalagens 100% recicláveis ou certificadas até 2025.",
    esgCommitment: "O Arcos Dorados incentiva o descarte correto de resíduos e busca neutralizar as emissões de gases de efeito estufa em toda a sua cadeia produtiva na América Latina.",
    logoColor: "#DA291C",
    logoText: "M",
    themeColor: "rgba(218, 41, 28, 0.1)"
  },
  {
    id: "renner-15off",
    name: "Cupom de 15% OFF",
    company: "Renner",
    points: 700,
    category: "Moda",
    esgBadge: "Algodão Certificado",
    description: "Ganhe 15% de desconto em peças selecionadas nas Lojas Renner. Válido em lojas físicas apresentando o QR Code.",
    esgCommitment: "A Renner possui metas rigorosas relacionadas ao uso crescente de algodão certificado, redução de consumo de água no beneficiamento do jeans e transição para energias renováveis.",
    logoColor: "#C20000",
    logoText: "R",
    themeColor: "rgba(194, 0, 0, 0.1)"
  },
  {
    id: "zara-cupom",
    name: "Cupom de R$ 50",
    company: "Zara",
    points: 500,
    category: "Moda",
    esgBadge: "Moda Circular",
    description: "Ganhe R$ 50 de desconto em compras acima de R$ 250 nas lojas participantes. Promovendo a moda circular.",
    esgCommitment: "Através da coleção Join Life, a Zara utiliza fibras ambientalmente preferenciais (como algodão orgânico e poliéster reciclado) e apoia a reciclagem têxtil de pós-consumo.",
    logoColor: "#111111",
    logoText: "ZARA",
    themeColor: "rgba(17, 17, 17, 0.1)"
  },
  {
    id: "starbucks-copo",
    name: "Bebida Grátis (Copo Próprio)",
    company: "Starbucks",
    points: 300,
    category: "Alimentação",
    esgBadge: "Lixo Zero",
    description: "Ganhe uma bebida de até 300ml grátis ao trazer seu copo reutilizável para a Starbucks. Ajude-nos a reduzir resíduos descartáveis.",
    esgCommitment: "A Starbucks busca reduzir em 50% as emissões de carbono, consumo de água e resíduos enviados para aterros sanitários até 2030, priorizando copos de uso múltiplo.",
    logoColor: "#00704A",
    logoText: "★",
    themeColor: "rgba(0, 112, 74, 0.1)"
  },
  {
    id: "spotify-premium",
    name: "1 Mês de Premium",
    company: "Spotify",
    points: 1200,
    category: "Serviços",
    esgBadge: "Carbono Neutro",
    description: "Resgate um código para 1 mês de Spotify Premium Individual. Curta músicas sem anúncios e offline.",
    esgCommitment: "O Spotify assumiu o compromisso Net-Zero para atingir zero emissões líquidas de gases de efeito estufa em toda a sua cadeia de valor até 2030, compensando suas atividades.",
    logoColor: "#1DB954",
    logoText: "S",
    themeColor: "rgba(29, 185, 84, 0.1)"
  }
];

const LEVELS = [
  {
    name: "Semente",
    minPoints: 0,
    icon: "sprout",
    color: "#10B981"
  },
  {
    name: "Broto",
    minPoints: 500,
    icon: "leaf",
    color: "#22C55E"
  },
  {
    name: "Árvore",
    minPoints: 1500,
    icon: "tree-pine",
    color: "#059669"
  },
  {
    name: "Floresta",
    minPoints: 3000,
    icon: "trees",
    color: "#047857"
  }
];

const ACHIEVEMENTS = [
  {
    id: "first_action",
    title: "Primeiro Passo",
    description: "Registrou sua primeira ação sustentável no EcoTroca.",
    icon: "award",
    color: "#3B82F6"
  },
  {
    id: "five_actions",
    title: "Eco Ativista",
    description: "Registrou pelo menos 5 ações ambientais.",
    icon: "shield-check",
    color: "#8B5CF6"
  },
  {
    id: "first_redeem",
    title: "Recompensa Verde",
    description: "Efetuou seu primeiro resgate no marketplace.",
    icon: "ticket",
    color: "#F59E0B"
  },
  {
    id: "pedal_power",
    title: "Eco-Ciclista",
    description: "Pedalou e evitou mais de 2 kg de CO₂ acumulados.",
    icon: "bike",
    color: "#10B981"
  }
];
