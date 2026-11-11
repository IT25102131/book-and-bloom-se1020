const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const convId = 'e8af2843-7edd-4161-8850-49e6f41a74fa';
const logsDir = `C:/Users/USER/.gemini/antigravity/brain/${convId}/.system_generated/logs`;
const transcriptPath = path.join(logsDir, 'transcript_full.jsonl');
const outputDir = path.join(__dirname, '..', 'chat_export');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function exportChat() {
  console.log('Reading full transcript from:', transcriptPath);
  
  const fileStream = fs.createReadStream(transcriptPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const dialog = [];
  let currentTurn = null;

  for await (const line of rl) {
    if (!line.trim()) continue;
    let obj;
    try {
      obj = JSON.parse(line);
    } catch (e) {
      continue;
    }

    if (obj.source === 'USER_EXPLICIT' && obj.type === 'USER_INPUT') {
      const userText = obj.content || '';
      const createdAt = obj.created_at || '';
      const media = obj.media || [];
      dialog.push({
        role: 'user',
        timestamp: createdAt,
        text: userText,
        media: media
      });
    } else if (obj.source === 'MODEL' && obj.type === 'PLANNER_RESPONSE' && obj.content && obj.content.trim().length > 0) {
      dialog.push({
        role: 'assistant',
        timestamp: obj.created_at || '',
        text: obj.content.trim()
      });
    }
  }

  console.log(`Extracted ${dialog.length} total dialogue turns.`);

  // 1. Generate Markdown export
  let mdContent = `# Book & Bloom (SE1020) — Full Chat Transcript & Conversation History\n\n`;
  mdContent += `> **Conversation ID:** \`${convId}\`  \n`;
  mdContent += `> **Project:** Book & Bloom Online Bookstore Management System (SLIIT SE1020)  \n`;
  mdContent += `> **Export Date:** ${new Date().toISOString()}  \n`;
  mdContent += `> **Total Dialog Turns:** ${dialog.length} messages  \n\n`;
  mdContent += `This document contains the complete, unabridged conversation record between the User and the AI Assistant (Antigravity). It includes all discussions, requirement changes, architecture designs, 6-member student allocations, MySQL setups, Sinhala viva guides, and A3 class diagram instructions.\n\n`;
  mdContent += `---\n\n## Table of Contents\n\n`;

  let userTurnCount = 0;
  for (let i = 0; i < dialog.length; i++) {
    const item = dialog[i];
    if (item.role === 'user') {
      userTurnCount++;
      const preview = item.text.replace(/\r?\n/g, ' ').substring(0, 75).trim() || '(Attachment/Image)';
      mdContent += `${userTurnCount}. [User Prompt ${userTurnCount}: ${preview}](#turn-${i + 1})\n`;
    }
  }

  mdContent += `\n---\n\n## Full Dialogue History\n\n`;

  for (let i = 0; i < dialog.length; i++) {
    const item = dialog[i];
    const turnNum = i + 1;
    const timeStr = item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A';

    if (item.role === 'user') {
      mdContent += `### <a id="turn-${turnNum}"></a>💬 Turn ${turnNum} — USER [${timeStr}]\n\n`;
      mdContent += `${item.text}\n\n`;
      if (item.media && item.media.length > 0) {
        mdContent += `**Attachments (${item.media.length}):**\n`;
        item.media.forEach((m, idx) => {
          mdContent += `- Attachment ${idx + 1}: \`${m.uri || m.mime_type}\`\n`;
        });
        mdContent += `\n`;
      }
      mdContent += `---\n\n`;
    } else {
      mdContent += `### 🤖 Turn ${turnNum} — ANTIGRAVITY (ASSISTANT) [${timeStr}]\n\n`;
      mdContent += `${item.text}\n\n`;
      mdContent += `---\n\n`;
    }
  }

  const mdPath = path.join(outputDir, 'FULL_CHAT_TRANSCRIPT.md');
  fs.writeFileSync(mdPath, mdContent, 'utf-8');
  console.log(`Wrote Markdown transcript to: ${mdPath} (${(mdContent.length / 1024).toFixed(1)} KB)`);

  // 2. Generate Continuation System Prompt (Handoff Document)
  let handoff = `# CONTINUATION MASTER PROMPT: Book & Bloom (SE1020) Online Bookstore

Use this prompt to continue this exact project in any other AI assistant (ChatGPT, Claude, Cursor, Antigravity, or Gemini). Copy and paste everything below into the new chat window:

\`\`\`markdown
You are an expert Java & Spring Boot Software Engineer assisting a student team from SLIIT with their SE1020 Object Oriented Programming Prorata Final Project named "Book & Bloom".

### 1. PROJECT SUMMARY & DOMAIN
- Project Name: Book & Bloom (Online Bookstore Management System)
- Institution: SLIIT · Faculty of Computing · Module SE1020 (Object Oriented Programming)
- Architecture: Three-Tier MVC + Repository Pattern (Dual Engine: Atomic File State & Relational MySQL 8.0)
- Frameworks: Java 26 / Spring Boot 3.4.2 / Jakarta Servlets / JSP Pages & HTML5/CSS3 UI
- Server URL: http://127.0.0.1:8080 (or http://localhost:8080)
- GitHub Repo: https://github.com/IT25102131/book-and-bloom-se1020

### 2. SIX GROUP MEMBERS & ALLOCATIONS
1. IT25102131 (Leader): User Management & Auth (Abstract User -> Customer, AdminUser, UserService, PBKDF2 Password Hashing)
2. IT25102114: Book Management & Polymorphism (Abstract Book -> PrintedBook [courier fulfillment], EBook [instant download], BookService)
3. IT25102130: Order & Delivery Management (Order owns OrderLine via UML Composition, DeliveryFeePolicy rule engine, OrderService)
4. IT25101966: Author Management (Author with nationality, primaryGenre, accolades, bornYear, photoUrl, AuthorService, 1-to-many Book relation)
5. IT25102132: Category Management (Category hierarchy, CategoryService, 1-to-many Book relation)
6. IT25102519: Review & Rating Management (Review model, ReviewService, dual association to Book and User)

### 3. PERSISTENCE ARCHITECTURE
- StoreRepository (Interface)
- FileStoreRepository (Atomic file storage engine with process-wide FileLock)
- MysqlStoreRepository (Relational MySQL 8.0 engine mapping to tables: users, books, authors, categories, orders, order_lines, reviews)
- StoreState (Aggregated immutable snapshot holding collections of all 6 entities)

### 4. COMPLETED ARTIFACTS
- Official A3 Landscape UML 2.5 Class Diagram (420mm x 297mm) rendered to PDF, PNG, and SVG with complete 6-member connection matrix and SLIIT title block.
- Sinhala Final Viva Guide PDF answering every technical question (OOP, Polymorphism, Design Patterns, Git workflow, Database).
- Active Server running on port 8080.
\`\`\`
`;

  const handoffPath = path.join(outputDir, 'CONTINUATION_MASTER_PROMPT.md');
  fs.writeFileSync(handoffPath, handoff, 'utf-8');
  console.log(`Wrote Continuation prompt to: ${handoffPath}`);

  // 3. Generate HTML Viewer for offline browsing
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Book & Bloom — Full Conversation Archive</title>
<style>
  :root {
    --bg: #0F172A;
    --card-user: #1E293B;
    --card-bot: #0F2744;
    --text: #F8FAFC;
    --text-muted: #94A3B8;
    --accent: #38BDF8;
    --code-bg: #020617;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    margin: 0;
    padding: 24px;
    line-height: 1.6;
  }
  .container {
    max-width: 1000px;
    margin: 0 auto;
  }
  header {
    background: #1E293B;
    padding: 24px;
    border-radius: 12px;
    margin-bottom: 24px;
    border: 1px solid #334155;
  }
  h1 { margin: 0 0 8px 0; color: #38BDF8; font-size: 26px; }
  .badge { display: inline-block; background: #0284C7; color: #fff; padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: bold; margin-right: 8px; }
  .msg-card {
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px;
    border: 1px solid #334155;
  }
  .msg-user {
    background: #1E293B;
    border-left: 5px solid #38BDF8;
  }
  .msg-bot {
    background: #172554;
    border-left: 5px solid #22C55E;
  }
  .msg-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 13px;
    color: var(--text-muted);
    font-weight: bold;
  }
  .role-tag {
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #38BDF8;
  }
  .msg-bot .role-tag { color: #4ADE80; }
  pre {
    background: var(--code-bg);
    padding: 14px;
    border-radius: 8px;
    overflow-x: auto;
    border: 1px solid #1E293B;
  }
  code { font-family: 'Consolas', 'Fira Code', monospace; font-size: 13.5px; }
  p { margin: 8px 0; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; }
  th, td { border: 1px solid #334155; padding: 8px 12px; text-align: left; }
  th { background: #0284C7; color: #fff; }
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>📚 Book &amp; Bloom (SE1020) — Full Conversation Archive</h1>
    <p>Complete record of all discussion turns, project updates, Sinhala guides, and class diagram engineering.</p>
    <div>
      <span class="badge">Conversation ID: ${convId}</span>
      <span class="badge">Turns: ${dialog.length}</span>
      <span class="badge">Status: Complete &amp; Exported</span>
    </div>
  </header>
`;

  for (let i = 0; i < dialog.length; i++) {
    const item = dialog[i];
    const isUser = item.role === 'user';
    const cardClass = isUser ? 'msg-user' : 'msg-bot';
    const roleName = isUser ? 'USER' : 'ANTIGRAVITY AI';
    const timeStr = item.timestamp ? new Date(item.timestamp).toLocaleString() : '';

    html += `
  <div class="msg-card ${cardClass}" id="turn-${i+1}">
    <div class="msg-header">
      <span class="role-tag">${roleName} (Turn ${i+1})</span>
      <span>${timeStr}</span>
    </div>
    <div class="msg-body">
      <pre style="white-space: pre-wrap; font-family: inherit; background: transparent; border: none; padding: 0;">${escapeHtml(item.text)}</pre>
    </div>
  </div>`;
  }

  html += `
</div>
</body>
</html>`;

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  const htmlPath = path.join(outputDir, 'FULL_CHAT_VIEWER.html');
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log(`Wrote HTML viewer to: ${htmlPath}`);

  // Copy raw JSONL logs
  fs.copyFileSync(transcriptPath, path.join(outputDir, 'transcript_full.jsonl'));
  const shortTranscript = path.join(logsDir, 'transcript.jsonl');
  if (fs.existsSync(shortTranscript)) {
    fs.copyFileSync(shortTranscript, path.join(outputDir, 'transcript.jsonl'));
  }

  // Copy Key PDFs and Diagrams
  const docsDir = path.join(__dirname, '..', 'docs');
  const filesToCopy = [
    'Book-and-Bloom-SE1020-Class-Diagram-A3.pdf',
    'Book-and-Bloom-SE1020-Class-Diagram-A3.png',
    'class-diagram-A3.svg',
    'Book-and-Bloom-SE1020-Final-Viva-Master-Guide-Sinhala.pdf',
    'FINAL_VIVA_AND_EVALUATION_GUIDE.md',
    'CLASS_DIAGRAM.md'
  ];

  for (const f of filesToCopy) {
    const src = path.join(docsDir, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(outputDir, f));
      console.log(`Copied asset: ${f}`);
    }
  }

  // 4. Create ZIP package on Desktop using PowerShell Compress-Archive
  const desktopZip = 'C:\\Users\\USER\\Desktop\\Book-and-Bloom-SE1020-Full-Chat-And-Continuation-Package.zip';
  const localZip = path.join(__dirname, '..', 'Book-and-Bloom-SE1020-Full-Chat-And-Continuation-Package.zip');

  console.log('Compressing into ZIP package...');
  if (fs.existsSync(desktopZip)) fs.unlinkSync(desktopZip);
  if (fs.existsSync(localZip)) fs.unlinkSync(localZip);

  execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${outputDir}\\*' -DestinationPath '${desktopZip}' -Force"`, { stdio: 'inherit' });
  console.log(`Generated Desktop ZIP: ${desktopZip}`);

  fs.copyFileSync(desktopZip, localZip);
  console.log(`Generated Local ZIP: ${localZip}`);
}

exportChat().catch(console.error);
