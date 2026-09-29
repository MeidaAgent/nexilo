/**
 * NEXILO INTERACTIVE ENGINE
 * Real-time streaming simulation, x402 payment flow visualizer,
 * dynamic pricing calculator & interactive UI controls.
 */

// Modal Management
function openModal(modalId) {
 const modal = document.getElementById(modalId);
 if (modal) {
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
 }
}

function closeModal(modalId) {
 const modal = document.getElementById(modalId);
 if (modal) {
  modal.classList.remove('open');
  document.body.style.overflow = '';
 }
}

function handleModalBackdrop(event, modalId) {
 if (event.target.id === modalId) {
  closeModal(modalId);
 }
}

// Shortcuts for specific modals
function openPlaygroundModal() {
 openModal('modal-playground');
}

function openNodeModal() {
 openModal('modal-node');
}

function openModelsModal() {
 openModal('modal-models');
}

function openPricingModal() {
 openModal('modal-pricing');
}

function openDocsModal() {
 openModal('modal-docs');
}

// Mobile Menu
function toggleMobileMenu() {
 const drawer = document.getElementById('mobile-drawer');
 drawer.classList.toggle('open');
}

function closeMobileMenu() {
 const drawer = document.getElementById('mobile-drawer');
 drawer.classList.remove('open');
}

// Architecture Step Simulation (Triggered by 'How it works' button)
let isSimulating = false;
function triggerFlowSimulation() {
 if (isSimulating) return;
 isSimulating = true;

 const steps = [
  { id: 'step-wallet', label: 'Wallet signs ceiling...' },
  { id: 'step-payment', label: '402 HTTP challenge authorized...' },
  { id: 'step-orchestrator', label: 'Orchestrator routes to node...' },
  { id: 'step-gpunode', label: 'GPU streams tokens...' }
 ];

 const badge = document.getElementById('settlement-badge');
 const originalBadgeText = badge ? badge.innerText : '';

 // Clear previous active states
 steps.forEach(s => {
  const el = document.getElementById(s.id);
  if (el) el.classList.remove('active-pulse');
 });

 let index = 0;
 function runStep() {
  if (index > 0) {
   const prevEl = document.getElementById(steps[index - 1].id);
   if (prevEl) prevEl.classList.remove('active-pulse');
  }

  if (index < steps.length) {
   const currentEl = document.getElementById(steps[index].id);
   if (currentEl) currentEl.classList.add('active-pulse');
   if (badge) badge.innerText = steps[index].label;
   index++;
   setTimeout(runStep, 700);
  } else {
   if (badge) {
    badge.innerText = 'Settled (Multi-Chain): $0.00042 USDT (receipt verified)';
    badge.style.color = '#10b981';
   }
   setTimeout(() => {
    if (badge) {
     badge.innerText = originalBadgeText;
     badge.style.color = '';
    }
    isSimulating = false;
   }, 2500);
  }
 }

 runStep();
}

// Interactive Playground Simulation
let streamTimer = null;
const modelResponses = {
 llama3: "Nexilo's decentralized inference protocol utilizes HTTP 402 Payment Required status headers to negotiate streaming quotas in USDT. Your local client signs an off-chain spending allowance. As output tokens stream over the WebSocket channel from independent GPU nodes, micro-settlement commitments are verified cryptographically. Once complete, an atomic multi-party batch settlement executes on any chain, routing 90% directly to the node operator and 10% to network pool reserves.",
 deepseek: "DeepSeek-V3 on Nexilo operates across distributed 80GB VRAM clusters. Decentralized routing ensures your prompt never hits centralized gatekeepers, logging proxies, or surveillance databases. Latency is optimized through dynamic latency-weighted ping triangulation across verified node operators worldwide.",
 qwen: "```python\n# Nexilo x402 Direct Streaming Client\nimport nexilo\n\nasync with nexilo.AsyncClient(ceiling_usdt=2.0) as client:\n  stream = await client.chat.stream('qwen-2.5-72b-coder', prompt='fibonacci')\n  async for chunk in stream:\n    print(chunk.text, end='')\n```\nStreaming confirmed. Settlement receipt generated on-chain.",
 mistral: "Mistral Large 2 delivers high-precision multilingual reasoning. With zero proprietary lock-in, operators can spin up node daemons in under 3 minutes using Docker or bare-metal Linux drivers."
};

function setPrompt(text) {
 const input = document.getElementById('playground-prompt-input');
 if (input) input.value = text;
}

function testModelInPlayground(modelKey) {
 closeModal('modal-models');
 openModal('modal-playground');
 const sel = document.getElementById('model-select');
 if (sel) sel.value = modelKey;
 setTimeout(runPlaygroundStream, 300);
}

async function fetchAIResponse(prompt, modelKey) {
  const apiKey = 'oao-store-hNwhQeNaQuS7MOUjGfVukkHGctNsyXBI';
  const apiModelMapping = {
    gpt6: 'gpt-6-astra',
    claude5: 'claude-opus-5.5',
    deepseek4: 'deepseek-v4-pro',
    gemini3: 'gemini-3.8-flash'
  };
  const actualModel = apiModelMapping[modelKey] || 'gpt-6-astra';
  
  try {
    const res = await fetch('https://oao.clipora.buzz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: actualModel,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    if (data && data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    }
    return null;
  } catch (err) {
    console.error("API Fetch Error (Likely CORS):", err);
    return null;
  }
}

async function runPlaygroundStream() {
 if (streamTimer) clearInterval(streamTimer);

 const modelSelect = document.getElementById('model-select');
 const modelKey = modelSelect ? modelSelect.value : 'gpt6';
 const promptInput = document.getElementById('playground-prompt-input');
 const promptText = promptInput ? promptInput.value.trim() : "Explain decentralized AI";

 const terminal = document.getElementById('playground-terminal-output');
 const statusBadge = document.getElementById('stream-status-badge');
 const statTokens = document.getElementById('stat-tokens');
 const statSpeed = document.getElementById('stat-speed');
 const statCost = document.getElementById('stat-cost');

 if (terminal) terminal.innerText = "Requesting node allowance...";
 if (statusBadge) {
  statusBadge.innerText = "Connecting x402...";
  statusBadge.style.color = "#f59e0b";
 }

 const fullText = await fetchAIResponse(promptText, modelKey);

 let charIndex = 0;
 let tokenCount = 0;
 const startTime = Date.now();

 if (statusBadge) {
  statusBadge.innerText = "Streaming (Active)";
  statusBadge.style.color = "#10b981";
 }

 streamTimer = setInterval(() => {
  const step = Math.floor(Math.random() * 4) + 4;
  charIndex += step;
  tokenCount += Math.floor(step / 3.5) + 1;

  if (charIndex >= fullText.length) {
   if (terminal) terminal.innerText = fullText;
   clearInterval(streamTimer);
   streamTimer = null;

   if (statusBadge) {
    statusBadge.innerText = "Settled (Multi-Chain)";
    statusBadge.style.color = "#38bdf8";
   }

   const elapsedSec = Math.max(0.5, (Date.now() - startTime) / 1000);
   const tokPerSec = Math.round(tokenCount / elapsedSec);
   if (statSpeed) statSpeed.innerText = `${tokPerSec} tok/s`;
   if (statTokens) statTokens.innerText = tokenCount;
   if (statCost) statCost.innerText = `$${(tokenCount * 0.0000008).toFixed(6)} USDT`;
   return;
  }

  if (terminal) {
   terminal.innerText = fullText.slice(0, charIndex) + " ";
   terminal.scrollTop = terminal.scrollHeight;
  }

  const elapsedSec = Math.max(0.2, (Date.now() - startTime) / 1000);
  const tokPerSec = Math.round(tokenCount / elapsedSec);
  if (statSpeed) statSpeed.innerText = `${tokPerSec} tok/s`;
  if (statTokens) statTokens.innerText = tokenCount;
  if (statCost) statCost.innerText = `$${(tokenCount * 0.0000008).toFixed(6)} USDT`;
 }, 20);
}

// Pricing Calculator
function updatePricingCalc() {
 const slider = document.getElementById('token-slider');
 const display = document.getElementById('token-display');
 const nexiloPrice = document.getElementById('calc-nexilo-price');
 const cloudPrice = document.getElementById('calc-cloud-price');
 const savings = document.getElementById('calc-savings');

 if (!slider) return;
 const tokens = parseInt(slider.value, 10);
 if (display) display.innerText = tokens.toLocaleString();

 // Nexilo avg: $0.60 per 1M tokens
 const nexCost = (tokens / 1000000) * 0.60;
 // Legacy Cloud avg: $2.80 per 1M tokens
 const legacyCost = (tokens / 1000000) * 2.80;

 if (nexiloPrice) nexiloPrice.innerText = `$${nexCost.toFixed(2)}`;
 if (cloudPrice) cloudPrice.innerText = `$${legacyCost.toFixed(2)}`;

 const pct = Math.round(((legacyCost - nexCost) / legacyCost) * 100);
 if (savings) savings.innerText = `${pct}%`;
}

// Node Command Copy
function copyNodeCommand() {
 const cmd = document.getElementById('node-cmd');
 if (cmd) {
  navigator.clipboard.writeText(cmd.innerText.trim()).then(() => {
   alert("Command copied to clipboard!\n\nRun this in your Linux terminal or Docker container to launch a node.");
  });
 }
}

// Interactive 3D tilt effect on the hero logo
document.addEventListener('DOMContentLoaded', () => {
 const logoWrap = document.getElementById('floating-logo-wrap');
 const logoImg = document.getElementById('hero-3d-logo');

 if (logoWrap && logoImg) {
  logoWrap.addEventListener('mousemove', (e) => {
   const rect = logoWrap.getBoundingClientRect();
   const x = e.clientX - rect.left - rect.width / 2;
   const y = e.clientY - rect.top - rect.height / 2;
   const tiltX = (y / (rect.height / 2)) * -14;
   const tiltY = (x / (rect.width / 2)) * 14;
   logoImg.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.05, 1.05, 1.05)`;
  });

  logoWrap.addEventListener('mouseleave', () => {
   logoImg.style.transform = '';
  });
 }

 // Close modals on Escape key
 document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
   document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
   document.body.style.overflow = '';
  }
 });
});

// =====================================================================
// SUBPAGE INTERACTIVE FUNCTIONS
// =====================================================================

// Snippet Copy Helper
function copySnippet(elementId) {
 const el = document.getElementById(elementId);
 if (!el) return;
 const text = el.innerText || el.textContent;
 navigator.clipboard.writeText(text.trim()).then(() => {
  alert("Code snippet copied to clipboard!");
 });
}

// Node Earnings Calculator (node.html)
function calculateNodeEarnings() {
 const select = document.getElementById('gpu-type-select');
 const slider = document.getElementById('gpu-count-slider');
 const label = document.getElementById('gpu-count-label');
 const estMonthly = document.getElementById('est-monthly-earn');
 const estDaily = document.getElementById('est-daily-earn');

 if (!select || !slider) return;

 const count = parseInt(slider.value, 10);
 if (label) label.innerText = `${count} GPU${count > 1 ? 's' : ''}`;

 const baseRates = {
  '4090': 260,
  '3090': 190,
  '6000': 480,
  'a100': 850,
  'h100': 1750
 };

 const rate = baseRates[select.value] || 850;
 const totalMonthly = rate * count;
 const totalDaily = (totalMonthly / 30).toFixed(2);

 if (estMonthly) estMonthly.innerText = `$${totalMonthly.toLocaleString()} USDT`;
 if (estDaily) estDaily.innerText = `~$${totalDaily} USDT`;
}

// Pricing Page Calculator (pricing.html)
function updatePagePricingCalc() {
 const slider = document.getElementById('token-slider-page');
 const display = document.getElementById('page-token-display');
 const nexiloCost = document.getElementById('page-nexilo-cost');
 const legacyCost = document.getElementById('page-legacy-cost');
 const savings = document.getElementById('page-savings-amount');

 if (!slider) return;
 const tokens = parseInt(slider.value, 10);
 if (display) display.innerText = tokens.toLocaleString();

 const nex = (tokens / 1000000) * 0.60;
 const leg = (tokens / 1000000) * 2.80;
 const diff = leg - nex;

 if (nexiloCost) nexiloCost.innerText = `$${nex.toFixed(2)}`;
 if (legacyCost) legacyCost.innerText = `$${leg.toFixed(2)}`;
 if (savings) savings.innerText = `$${diff.toFixed(2)} / mo`;
}

// Studio / Playground Page Functions (playground.html)
let studioStreamTimer = null;

function switchStudioModel() {
 const sel = document.getElementById('studio-model');
 const title = document.getElementById('active-model-title');
 if (sel && title) {
  title.innerText = sel.options[sel.selectedIndex].text.split('(')[0].trim();
 }
}

function setStudioPrompt(text) {
 const inp = document.getElementById('studio-prompt-input');
 if (inp) inp.value = text;
}

function clearStudioChat() {
 const display = document.getElementById('studio-chat-display');
 if (display) {
  display.innerHTML = `
   <div class="chat-message assistant">
    <div class="msg-avatar">
     <img src="nexilo_logo_transparent.png" alt="Nexilo" />
    </div>
    <div class="msg-body" id="studio-output-text">
     Studio cleared. Ready for your prompt.
    </div>
   </div>
  `;
 }
 const counter = document.getElementById('studio-tokens-counter');
 const cost = document.getElementById('studio-settled-cost');
 const speed = document.getElementById('studio-speed-counter');
 if (counter) counter.innerText = '0';
 if (cost) cost.innerText = '$0.000000 USDT';
 if (speed) speed.innerText = '0 tok/s';
}

function copyStudioOutput() {
 const out = document.getElementById('studio-output-text');
 if (out) {
  navigator.clipboard.writeText(out.innerText.trim()).then(() => {
   alert("Assistant response copied to clipboard!");
  });
 }
}

async function runStudioStream() {
 if (studioStreamTimer) clearInterval(studioStreamTimer);

 const promptInput = document.getElementById('studio-prompt-input');
 const promptText = promptInput ? promptInput.value.trim() : "Explain decentralized AI";
 if (!promptText) return;

 const display = document.getElementById('studio-chat-display');
 const modelSelect = document.getElementById('studio-model');
 const modelKey = modelSelect ? modelSelect.value : 'gpt6';

 // Append user message
 const userMsg = document.createElement('div');
 userMsg.className = 'chat-message user';
 userMsg.innerHTML = `<div class="msg-body">${promptText}</div>`;
 display.appendChild(userMsg);

 // Append assistant message container
 const assistantMsg = document.createElement('div');
 assistantMsg.className = 'chat-message assistant';
 assistantMsg.innerHTML = `
  <div class="msg-avatar">
   <img src="nexilo_logo_transparent.png" alt="Nexilo" />
  </div>
  <div class="msg-body">Connecting to GPU mesh node...</div>
 `;
 display.appendChild(assistantMsg);
 display.scrollTop = display.scrollHeight;

 let fullResponse = await fetchAIResponse(promptText, modelKey);
 if (!fullResponse) {
   fullResponse = modelResponses[modelKey] || modelResponses.gpt6;
 }

 const responseBody = assistantMsg.querySelector('.msg-body');
 const tokenCounter = document.getElementById('studio-tokens-counter');
 const speedCounter = document.getElementById('studio-speed-counter');
 const settledCost = document.getElementById('studio-settled-cost');

 let charIndex = 0;
 let tokenCount = 0;
 const startTime = Date.now();

 studioStreamTimer = setInterval(() => {
  const step = Math.floor(Math.random() * 5) + 4;
  charIndex += step;
  tokenCount += Math.floor(step / 3.5) + 1;

  if (charIndex >= fullResponse.length) {
   responseBody.innerText = fullResponse;
   clearInterval(studioStreamTimer);
   studioStreamTimer = null;

   const elapsed = Math.max(0.5, (Date.now() - startTime) / 1000);
   const tokPerSec = Math.round(tokenCount / elapsed);
   if (speedCounter) speedCounter.innerText = `${tokPerSec} tok/s`;
   if (tokenCounter) tokenCounter.innerText = tokenCount;
   if (settledCost) settledCost.innerText = `$${(tokenCount * 0.0000008).toFixed(6)} USDT`;
   return;
  }

  responseBody.innerText = fullResponse.slice(0, charIndex) + " ";
  display.scrollTop = display.scrollHeight;

  const elapsed = Math.max(0.2, (Date.now() - startTime) / 1000);
  const tokPerSec = Math.round(tokenCount / elapsed);
  if (speedCounter) speedCounter.innerText = `${tokPerSec} tok/s`;
  if (tokenCounter) tokenCounter.innerText = tokenCount;
  if (settledCost) settledCost.innerText = `$${(tokenCount * 0.0000008).toFixed(6)} USDT`;
 }, 20);
}

