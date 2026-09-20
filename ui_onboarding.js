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
 * Desenha o modal de boas-vindas centralizado
 */
function drawOnboardingWelcomeModal(step) {
  // Fundo escurecido suave
  noStroke();
  fill(0, 0, 0, 190);
  rect(0, 0, width, height);

  const modalW = Math.min(560, Math.max(300, width - 40));
  const modalH = Math.min(420, Math.max(340, height - 60));
  const modalX = (width - modalW) / 2;
  const modalY = (height - modalH) / 2;

  // Sombra e card do modal
  fill(lightMode ? "#FFFFFF" : "#222222");
  stroke("#959fff");
  strokeWeight(2);
  rect(modalX, modalY, modalW, modalH, 12);

  // Faixa superior decorativa em pastel
  noStroke();
  fill("#959fff");
  rect(modalX, modalY, modalW, 6, 12, 12, 0, 0);

  // Badge / Categoria
  fill(lightMode ? "#2554FF" : "#959fff");
  textFont(fontes.afacad);
  textStyle(BOLD);
  textSize(13);
  textAlign(CENTER, TOP);
  text("PROJETO TAGRAFIA • PCC DE DESIGN", width / 2, modalY + 28);

  // Título principal
  fill(lightMode ? "#000000" : "#FFFFFF");
  textSize(28);
  text(step.title, width / 2, modalY + 48);

  // Subtítulo
  fill(lightMode ? "#555555" : "#D0D0D0");
  textSize(15);
  textStyle(NORMAL);
  text(step.subtitle, width / 2, modalY + 84);

  // Divisor horizontal
  stroke(lightMode ? "#E0E0E0" : "#383838");
  strokeWeight(1);
  line(modalX + 30, modalY + 115, modalX + modalW - 30, modalY + 115);

  // Texto explicativo do projeto
  noStroke();
  fill(lightMode ? "#222222" : "#E8E8E8");
  textFont(fontes.roboto);
  textSize(13.5);
  textLeading(21);
  textAlign(LEFT, TOP);
  const textX = modalX + 32;
  const textW = modalW - 64;
  text(step.description, textX, modalY + 130, textW, 110);

  // Três colunas resumo das áreas
  const pillW = (textW - 16) / 3;
  const pillY = modalY + 225;
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

  // Botões inferiores: "Explorar Direto" e "Iniciar Tutorial"
  const btnH = 38;
  const btnY = modalY + modalH - 58;

  // Botão 1: Pular / Explorar Direto
  const skipW = 140;
  const skipX = modalX + 32;
  const skipHover = insideRect(mouseX, mouseY, skipX, btnY, skipW, btnH);
  if (skipHover && typeof requestCursor === "function") requestCursor(HAND);

  noStroke();
  fill(skipHover ? (lightMode ? "#E8EAF0" : "#363636") : (lightMode ? "#F0F2F6" : "#2A2A2A"));
  rect(skipX, btnY, skipW, btnH, 6);
  fill(lightMode ? "#444444" : "#D0D0D0");
  textFont(fontes.afacad);
  textStyle(BOLD);
  textSize(13.5);
  textAlign(CENTER, CENTER);
  text("Explorar Direto", skipX + skipW / 2, btnY + btnH / 2);

  // Botão 2: Iniciar Tutorial (Destaque Azul)
  const startW = modalW - 64 - skipW - 14;
  const startX = skipX + skipW + 14;
  const startHover = insideRect(mouseX, mouseY, startX, btnY, startW, btnH);
  if (startHover && typeof requestCursor === "function") requestCursor(HAND);

  fill(startHover ? "#2554FF" : (typeof COLORS !== "undefined" && COLORS.blue ? COLORS.blue : "#3E4AD3"));
  rect(startX, btnY, startW, btnH, 6);
  fill("#FFFFFF");
  textFont(fontes.afacad);
  textStyle(BOLD);
  textSize(14);
  textAlign(CENTER, CENTER);
  text("Iniciar Tutorial dos Menus →", startX + startW / 2, btnY + btnH / 2);
}

/**
 * Desenha o passo guiado com destaque visual (spotlight) na zona correspondente
 */
function drawOnboardingGuidedStep(step, stepIndex, totalSteps) {
  const scl = filterPanelScale();
  const leftW = (LAYOUT_NAV_W + (leftPanelExtendedOpen ? LAYOUT_FILTRO_W : 0)) * scl;
  const rightX = productPanelX();
  const rightW = productPanelW();

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

  // Desenha as 4 faixas de máscara escura ao redor da área de spotlight
  noStroke();
  fill(0, 0, 0, 195);
  // Topo
  if (spotY > 0) rect(0, 0, width, spotY);
  // Base
  if (spotY + spotH < height) rect(0, spotY + spotH, width, height - (spotY + spotH));
  // Esquerda
  if (spotX > 0) rect(0, spotY, spotX, spotH);
  // Direita
  if (spotX + spotW < width) rect(spotX + spotW, spotY, width - (spotX + spotW), spotH);

  // Borda suave brilhante ao redor da zona destacada
  const pulse = Math.sin(frameCount * 0.08) * 0.5 + 0.5;
  noFill();
  stroke(149, 159, 255, 180 + pulse * 75);
  strokeWeight(2.5);
  rect(spotX + 1, spotY + 1, spotW - 2, spotH - 2, 4);

  // Posição do Card Flutuante de Explicação
  const cardW = Math.min(380, width - 40);
  const cardH = 210;
  let cardX = 0;
  let cardY = (height - cardH) / 2;

  if (step.zone === "left") {
    // Posiciona à direita do menu esquerdo
    cardX = Math.min(width - cardW - 20, spotX + spotW + 24);
  } else if (step.zone === "right") {
    // Posiciona à esquerda do menu direito
    cardX = Math.max(20, spotX - cardW - 24);
  } else {
    // Centralizado sobre a área visual
    cardX = (width - cardW) / 2;
    cardY = 50; // no topo da área central para não tapar o círculo principal
  }

  // Card flutuante
  fill(lightMode ? "#FFFFFF" : "#222222");
  stroke("#959fff");
  strokeWeight(2);
  rect(cardX, cardY, cardW, cardH, 10);

  // Cabeçalho do Card
  noStroke();
  fill(lightMode ? "#2554FF" : "#959fff");
  textFont(fontes.afacad);
  textStyle(BOLD);
  textSize(12);
  textAlign(LEFT, TOP);
  text(`PASSO ${stepIndex} DE ${totalSteps - 1}`, cardX + 20, cardY + 16);

  // Título do passo
  fill(lightMode ? "#000000" : "#FFFFFF");
  textSize(17);
  text(step.title, cardX + 20, cardY + 34, cardW - 40, 24);

  // Linha sutil divisória
  stroke(lightMode ? "#E4E6ED" : "#363636");
  strokeWeight(1);
  line(cardX + 20, cardY + 64, cardX + cardW - 20, cardY + 64);

  // Descrição do passo
  noStroke();
  fill(lightMode ? "#222222" : "#E8E8E8");
  textFont(fontes.roboto);
  textStyle(NORMAL);
  textSize(12.5);
  textLeading(18);
  textAlign(LEFT, TOP);
  text(step.description, cardX + 20, cardY + 74, cardW - 40, 75);

  // Botões do Card Flutuante
  const bY = cardY + cardH - 42;
  const bH = 30;

  // Pular (esquerda)
  const isSkipHover = insideRect(mouseX, mouseY, cardX + 20, bY, 55, bH);
  if (isSkipHover && typeof requestCursor === "function") requestCursor(HAND);
  fill(lightMode ? (isSkipHover ? "#000000" : "#777777") : (isSkipHover ? "#FFFFFF" : "#AAAAAA"));
  textFont(fontes.afacad);
  textStyle(BOLD);
  textSize(12);
  textAlign(LEFT, CENTER);
  text("Pular", cardX + 20, bY + bH / 2);

  // Indicador de pontos (dots) no centro
  for (let d = 1; d < totalSteps; d++) {
    const dotX = cardX + cardW / 2 - (totalSteps * 8) / 2 + d * 10;
    noStroke();
    if (d === stepIndex) {
      fill("#959fff");
      circle(dotX, bY + bH / 2, 7);
    } else {
      fill(lightMode ? "#CCCCCC" : "#555555");
      circle(dotX, bY + bH / 2, 5);
    }
  }

  // Anterior (se > 1)
  let nextX = cardX + cardW - 95;
  const nextW = 75;
  if (stepIndex > 1) {
    const prevW = 65;
    const prevX = cardX + cardW - 165;
    const isPrevHover = insideRect(mouseX, mouseY, prevX, bY, prevW, bH);
    if (isPrevHover && typeof requestCursor === "function") requestCursor(HAND);

    noStroke();
    fill(isPrevHover ? (lightMode ? "#E8EAF0" : "#363636") : (lightMode ? "#F0F2F6" : "#2A2A2A"));
    rect(prevX, bY, prevW, bH, 5);

    fill(lightMode ? "#333333" : "#DDDDDD");
    textSize(12);
    textAlign(CENTER, CENTER);
    text("Anterior", prevX + prevW / 2, bY + bH / 2);
  } else {
    nextX = cardX + cardW - 100;
  }

  // Próximo / Concluir
  const isLast = stepIndex === totalSteps - 1;
  const isNextHover = insideRect(mouseX, mouseY, nextX, bY, nextW, bH);
  if (isNextHover && typeof requestCursor === "function") requestCursor(HAND);

  noStroke();
  fill(isNextHover ? "#2554FF" : (typeof COLORS !== "undefined" && COLORS.blue ? COLORS.blue : "#3E4AD3"));
  rect(nextX, bY, nextW, bH, 5);

  fill("#FFFFFF");
  textSize(12.5);
  textAlign(CENTER, CENTER);
  text(isLast ? "Concluir ✓" : "Próximo →", nextX + nextW / 2, bY + bH / 2);
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
    const modalW = Math.min(560, Math.max(300, width - 40));
    const modalH = Math.min(420, Math.max(340, height - 60));
    const modalX = (width - modalW) / 2;
    const modalY = (height - modalH) / 2;

    const btnH = 38;
    const btnY = modalY + modalH - 58;

    // Botão Explorar Direto / Pular
    const skipW = 140;
    const skipX = modalX + 32;
    if (insideRect(mx, my, skipX, btnY, skipW, btnH)) {
      skipOnboarding();
      return true;
    }

    // Botão Iniciar Tutorial
    const startW = modalW - 64 - skipW - 14;
    const startX = skipX + skipW + 14;
    if (insideRect(mx, my, startX, btnY, startW, btnH)) {
      nextOnboardingStep();
      return true;
    }

    // Clique fora do modal também fecha com segurança
    if (!insideRect(mx, my, modalX, modalY, modalW, modalH)) {
      skipOnboarding();
      return true;
    }
    return true;
  }

  // Passos 1..3 (Card Flutuante)
  const scl = filterPanelScale();
  const leftW = (LAYOUT_NAV_W + (leftPanelExtendedOpen ? LAYOUT_FILTRO_W : 0)) * scl;
  const rightX = productPanelX();

  const cardW = Math.min(380, width - 40);
  const cardH = 210;
  let cardX = 0;
  let cardY = (height - cardH) / 2;

  if (step.zone === "left") {
    cardX = Math.min(width - cardW - 20, leftW + 24);
  } else if (step.zone === "right") {
    cardX = Math.max(20, rightX - cardW - 24);
  } else {
    cardX = (width - cardW) / 2;
    cardY = 50;
  }

  const bY = cardY + cardH - 42;
  const bH = 30;

  // Botão Pular (esquerda)
  if (insideRect(mx, my, cardX + 10, bY - 4, 70, bH + 8)) {
    skipOnboarding();
    return true;
  }

  // Botão Anterior
  if (currentStepIndex > 1) {
    const prevW = 65;
    const prevX = cardX + cardW - 165;
    if (insideRect(mx, my, prevX, bY, prevW, bH)) {
      prevOnboardingStep();
      return true;
    }
  }

  // Botão Próximo / Concluir
  const nextX = currentStepIndex > 1 ? cardX + cardW - 95 : cardX + cardW - 100;
  const nextW = 85;
  if (insideRect(mx, my, nextX, bY, nextW, bH)) {
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
