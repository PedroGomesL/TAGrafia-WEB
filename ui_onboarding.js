// ui_onboarding.js - Tela de Apresentação e Tutorial Guiado do TAGrafia

function drawOnboarding() {
  if (typeof onboardingState === "undefined" || !onboardingState.active) return;

  const currentStepIndex = onboardingState.step;
  const steps = typeof ONBOARDING_STEPS !== "undefined" ? ONBOARDING_STEPS : [];
  const currentStep = steps[currentStepIndex] || steps[0];

  push();
  if (currentStep.zone === "modal" || currentStepIndex === 0) {
    drawOnboardingWelcomeModal(currentStep);
  } else {
    drawOnboardingGuidedStep(currentStep, currentStepIndex, steps.length);
  }
  pop();
}

/**
 * Métricas padronizadas para o modal de boas-vindas (passo 0)
 */
function getOnboardingModalMetrics() {
  const modalW = Math.min(560, Math.max(300, width - 40));
  const modalH = Math.min(420, Math.max(340, height - 60));
  const modalX = (width - modalW) / 2;
  const modalY = (height - modalH) / 2;

  const btnH = 38;
  const btnY = modalY + modalH - 58;

  const skipW = 140;
  const skipX = modalX + 32;

  const startW = modalW - 64 - skipW - 14;
  const startX = skipX + skipW + 14;

  return {
    modalX, modalY, modalW, modalH,
    btnY, btnH,
    skipX, skipW,
    startX, startW
  };
}

/**
 * Métricas padronizadas para os cards flutuantes guiados (passos 1..3)
 */
function getOnboardingGuidedMetrics(step, stepIndex, totalSteps) {
  const scl = typeof filterPanelScale === "function" ? filterPanelScale() : 1;
  const leftW = (typeof LAYOUT_NAV_W !== "undefined" ? (LAYOUT_NAV_W + (typeof leftPanelExtendedOpen !== "undefined" && leftPanelExtendedOpen ? LAYOUT_FILTRO_W : 0)) : 100) * scl;
  const rightX = typeof productPanelX === "function" ? productPanelX() : width - 400;
  const rightW = typeof productPanelW === "function" ? productPanelW() : 400;

  let spotX = 0;
  let spotY = 0;
  let spotW = 0;
  let spotH = height;

  if (step.zone === "left") {
    spotX = 0;
    spotY = 0;
    spotW = leftW;
    spotH = height;
  } else if (step.zone === "center") {
    spotX = leftW;
    spotY = 0;
    spotW = Math.max(10, rightX - leftW);
    spotH = height;
  } else if (step.zone === "right") {
    spotX = rightX;
    spotY = 0;
    spotW = rightW;
    spotH = height;
  }

  const cardW = Math.min(380, width - 40);
  const cardH = 210;
  let cardX = 0;
  let cardY = (height - cardH) / 2;

  if (step.zone === "left") {
    cardX = Math.min(width - cardW - 20, spotX + spotW + 24);
  } else if (step.zone === "right") {
    cardX = Math.max(20, spotX - cardW - 24);
  } else {
    cardX = (width - cardW) / 2;
    cardY = 50;
  }

  const bY = cardY + cardH - 42;
  const bH = 30;

  // Botão Pular (esquerda)
  const skipX = cardX + 20;
  const skipW = 55;

  // Botão Próximo / Concluir (direita)
  const nextW = 82;
  const nextX = cardX + cardW - 20 - nextW;

  // Botão Anterior (ao lado de Próximo se houver)
  const prevW = 68;
  const prevX = nextX - 8 - prevW;

  return {
    spotX, spotY, spotW, spotH,
    cardX, cardY, cardW, cardH,
    bY, bH,
    skipX, skipW,
    prevX, prevW,
    nextX, nextW,
    hasPrev: stepIndex > 1,
    isLast: stepIndex === totalSteps - 1
  };
}

/**
 * Desenha o modal de boas-vindas centralizado
 */
function drawOnboardingWelcomeModal(step) {
  // Fundo escurecido suave
  noStroke();
  fill(0, 0, 0, 190);
  rect(0, 0, width, height);

  const m = getOnboardingModalMetrics();

  // Sombra e card do modal
  fill(lightMode ? "#FFFFFF" : "#222222");
  stroke("#959fff");
  strokeWeight(2);
  rect(m.modalX, m.modalY, m.modalW, m.modalH, 12);

  // Faixa superior decorativa em pastel
  noStroke();
  fill("#959fff");
  rect(m.modalX, m.modalY, m.modalW, 6, 12, 12, 0, 0);

  // Badge / Categoria
  fill(lightMode ? "#2554FF" : "#959fff");
  textFont(fontes.afacad);
  textStyle(BOLD);
  textSize(13);
  textAlign(CENTER, TOP);
  text("PROJETO TAGRAFIA • PCC DE DESIGN", width / 2, m.modalY + 28);

  // Título principal
  fill(lightMode ? "#000000" : "#FFFFFF");
  textSize(28);
  text(step.title, width / 2, m.modalY + 48);

  // Subtítulo
  fill(lightMode ? "#555555" : "#D0D0D0");
  textSize(15);
  textStyle(NORMAL);
  text(step.subtitle, width / 2, m.modalY + 84);

  // Divisor horizontal
  stroke(lightMode ? "#E0E0E0" : "#383838");
  strokeWeight(1);
  line(m.modalX + 30, m.modalY + 115, m.modalX + m.modalW - 30, m.modalY + 115);

  // Texto explicativo do projeto
  noStroke();
  fill(lightMode ? "#222222" : "#E8E8E8");
  textFont(fontes.roboto);
  textSize(13.5);
  textLeading(21);
  textAlign(LEFT, TOP);
  const textX = m.modalX + 32;
  const textW = m.modalW - 64;
  text(step.description, textX, m.modalY + 130, textW, 110);

  // Três colunas resumo das áreas
  const pillW = (textW - 16) / 3;
  const pillY = m.modalY + 225;
  const cols = [
    { name: "Filtros", desc: "Menu Esquerdo", color: "#ff9597" },
    { name: "Visualizações", desc: "Área Central", color: "#959fff" },
    { name: "Detalhes", desc: "Menu Direito", color: "#a7ff95" },
  ];

  for (let i = 0; i < cols.length; i++) {
    const px = textX + i * (pillW + 8);
    fill(lightMode ? "#F4F5F9" : "#2A2A2A");
    stroke(lightMode ? "#E4E6ED" : "#404040");
    strokeWeight(1);
    rect(px, pillY, pillW, 46, 6);

    // Barra de cor superior
    noStroke();
    fill(cols[i].color);
    rect(px, pillY, pillW, 3, 6, 6, 0, 0);

    fill(lightMode ? "#000000" : "#FFFFFF");
    textFont(fontes.afacad);
    textStyle(BOLD);
    textSize(13);
    textAlign(CENTER, TOP);
    text(cols[i].name, px + pillW / 2, pillY + 9);

    fill(lightMode ? "#666666" : "#AAAAAA");
    textFont(fontes.roboto);
    textStyle(NORMAL);
    textSize(11);
    text(cols[i].desc, px + pillW / 2, pillY + 27);
  }

  // Botão 1: Pular / Explorar Direto
  const skipHover = insideRect(mouseX, mouseY, m.skipX, m.btnY, m.skipW, m.btnH);
  if (skipHover && typeof requestCursor === "function") requestCursor(HAND);

  noStroke();
  fill(skipHover ? (lightMode ? "#E8EAF0" : "#363636") : (lightMode ? "#F0F2F6" : "#2A2A2A"));
  rect(m.skipX, m.btnY, m.skipW, m.btnH, 6);
  fill(lightMode ? "#444444" : "#D0D0D0");
  textFont(fontes.afacad);
  textStyle(BOLD);
  textSize(13.5);
  textAlign(CENTER, CENTER);
  text("Explorar Direto", m.skipX + m.skipW / 2, m.btnY + m.btnH / 2);

  // Botão 2: Iniciar Tutorial (Destaque Azul)
  const startHover = insideRect(mouseX, mouseY, m.startX, m.btnY, m.startW, m.btnH);
  if (startHover && typeof requestCursor === "function") requestCursor(HAND);

  fill(startHover ? "#2554FF" : (typeof COLORS !== "undefined" && COLORS.blue ? COLORS.blue : "#3E4AD3"));
  rect(m.startX, m.btnY, m.startW, m.btnH, 6);
  fill("#FFFFFF");
  textFont(fontes.afacad);
  textStyle(BOLD);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("Iniciar Tutorial dos Menus →", m.startX + m.startW / 2, m.btnY + m.btnH / 2);
}

/**
 * Desenha o passo guiado com destaque visual (spotlight) na zona correspondente
 */
function drawOnboardingGuidedStep(step, stepIndex, totalSteps) {
  const m = getOnboardingGuidedMetrics(step, stepIndex, totalSteps);

  // Desenha as 4 faixas de máscara escura ao redor da área de spotlight
  noStroke();
  fill(0, 0, 0, 195);
  // Topo
  if (m.spotY > 0) rect(0, 0, width, m.spotY);
  // Base
  if (m.spotY + m.spotH < height) rect(0, m.spotY + m.spotH, width, height - (m.spotY + m.spotH));
  // Esquerda
  if (m.spotX > 0) rect(0, m.spotY, m.spotX, m.spotH);
  // Direita
  if (m.spotX + m.spotW < width) rect(m.spotX + m.spotW, m.spotY, width - (m.spotX + m.spotW), m.spotH);

  // Borda suave brilhante ao redor da zona destacada
  const pulse = Math.sin(frameCount * 0.08) * 0.5 + 0.5;
  noFill();
  stroke(149, 159, 255, 180 + pulse * 75);
  strokeWeight(2.5);
  rect(m.spotX + 1, m.spotY + 1, m.spotW - 2, m.spotH - 2, 4);

  // Card flutuante
  fill(lightMode ? "#FFFFFF" : "#222222");
  stroke("#959fff");
  strokeWeight(2);
  rect(m.cardX, m.cardY, m.cardW, m.cardH, 10);

  // Cabeçalho do Card
  noStroke();
  fill(lightMode ? "#2554FF" : "#959fff");
  textFont(fontes.afacad);
  textStyle(BOLD);
  textSize(12);
  textAlign(LEFT, TOP);
  text(`PASSO ${stepIndex} DE ${totalSteps - 1}`, m.cardX + 20, m.cardY + 16);

  // Título do passo
  fill(lightMode ? "#000000" : "#FFFFFF");
  textSize(17);
  text(step.title, m.cardX + 20, m.cardY + 34, m.cardW - 40, 24);

  // Linha sutil divisória
  stroke(lightMode ? "#E4E6ED" : "#363636");
  strokeWeight(1);
  line(m.cardX + 20, m.cardY + 64, m.cardX + m.cardW - 20, m.cardY + 64);

  // Descrição do passo
  noStroke();
  fill(lightMode ? "#222222" : "#E8E8E8");
  textFont(fontes.roboto);
  textStyle(NORMAL);
  textSize(12.5);
  textLeading(18);
  textAlign(LEFT, TOP);
  text(step.description, m.cardX + 20, m.cardY + 74, m.cardW - 40, 75);

  // Botão Pular (esquerda)
  const isSkipHover = insideRect(mouseX, mouseY, m.skipX, m.bY, m.skipW, m.bH);
  if (isSkipHover && typeof requestCursor === "function") requestCursor(HAND);
  fill(lightMode ? (isSkipHover ? "#000000" : "#777777") : (isSkipHover ? "#FFFFFF" : "#AAAAAA"));
  textFont(fontes.afacad);
  textStyle(BOLD);
  textSize(12);
  textAlign(LEFT, CENTER);
  text("Pular", m.skipX, m.bY + m.bH / 2);

  // Indicador de pontos (dots)
  for (let d = 1; d < totalSteps; d++) {
    const dotX = m.cardX + 90 + (d - 1) * 14;
    noStroke();
    if (d === stepIndex) {
      fill("#959fff");
      circle(dotX, m.bY + m.bH / 2, 7);
    } else {
      fill(lightMode ? "#CCCCCC" : "#555555");
      circle(dotX, m.bY + m.bH / 2, 5);
    }
  }

  // Anterior (se > 1)
  if (m.hasPrev) {
    const isPrevHover = insideRect(mouseX, mouseY, m.prevX, m.bY, m.prevW, m.bH);
    if (isPrevHover && typeof requestCursor === "function") requestCursor(HAND);

    noStroke();
    fill(isPrevHover ? (lightMode ? "#E8EAF0" : "#363636") : (lightMode ? "#F0F2F6" : "#2A2A2A"));
    rect(m.prevX, m.bY, m.prevW, m.bH, 5);

    fill(lightMode ? "#333333" : "#DDDDDD");
    textSize(12);
    textAlign(CENTER, CENTER);
    text("Anterior", m.prevX + m.prevW / 2, m.bY + m.bH / 2);
  }

  // Próximo / Concluir
  const isNextHover = insideRect(mouseX, mouseY, m.nextX, m.bY, m.nextW, m.bH);
  if (isNextHover && typeof requestCursor === "function") requestCursor(HAND);

  noStroke();
  fill(isNextHover ? "#2554FF" : (typeof COLORS !== "undefined" && COLORS.blue ? COLORS.blue : "#3E4AD3"));
  rect(m.nextX, m.bY, m.nextW, m.bH, 5);

  fill("#FFFFFF");
  textSize(12.5);
  textAlign(CENTER, CENTER);
  text(m.isLast ? "Concluir ✓" : "Próximo →", m.nextX + m.nextW / 2, m.bY + m.bH / 2);
}

/**
 * Trata cliques do mouse no overlay e cards do onboarding
 */
function onboardingMousePressed(mx, my) {
  if (typeof onboardingState === "undefined" || !onboardingState.active) return false;

  const currentStepIndex = onboardingState.step;
  const steps = typeof ONBOARDING_STEPS !== "undefined" ? ONBOARDING_STEPS : [];
  const currentStep = steps[currentStepIndex] || steps[0];

  if (currentStep.zone === "modal" || currentStepIndex === 0) {
    const m = getOnboardingModalMetrics();

    // Botão Explorar Direto / Pular
    if (insideRect(mx, my, m.skipX - 4, m.btnY - 4, m.skipW + 8, m.btnH + 8)) {
      skipOnboarding();
      return true;
    }

    // Botão Iniciar Tutorial
    if (insideRect(mx, my, m.startX - 4, m.btnY - 4, m.startW + 8, m.btnH + 8)) {
      nextOnboardingStep();
      return true;
    }

    // Clique fora do modal também fecha com segurança
    if (!insideRect(mx, my, m.modalX, m.modalY, m.modalW, m.modalH)) {
      skipOnboarding();
      return true;
    }
    return true;
  }

  // Passos 1..3 (Card Flutuante)
  const m = getOnboardingGuidedMetrics(currentStep, currentStepIndex, steps.length);

  // Botão Pular (esquerda)
  if (insideRect(mx, my, m.skipX - 6, m.bY - 4, m.skipW + 12, m.bH + 8)) {
    skipOnboarding();
    return true;
  }

  // Botão Anterior
  if (m.hasPrev) {
    if (insideRect(mx, my, m.prevX - 4, m.bY - 4, m.prevW + 8, m.bH + 8)) {
      prevOnboardingStep();
      return true;
    }
  }

  // Botão Próximo / Concluir
  if (insideRect(mx, my, m.nextX - 4, m.bY - 4, m.nextW + 8, m.bH + 8)) {
    nextOnboardingStep();
    return true;
  }

  // Absorve todos os cliques enquanto o onboarding estiver ativo
  return true;
}

/**
 * Trata navegação por teclado no onboarding
 */
function onboardingKeyPressed(k) {
  if (typeof onboardingState === "undefined" || !onboardingState.active) return false;

  if (k === ESCAPE) {
    skipOnboarding();
    return true;
  }
  if (k === ENTER || k === 32 /* Space */ || k === RIGHT_ARROW) {
    nextOnboardingStep();
    return true;
  }
  if (k === LEFT_ARROW) {
    prevOnboardingStep();
    return true;
  }
  return false;
}

