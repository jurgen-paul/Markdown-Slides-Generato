export interface SampleTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  themeId: string;
  markdown: string;
}

export const SAMPLE_TEMPLATES: SampleTemplate[] = [
  {
    id: 'startup-pitch',
    name: 'Startup Pitch Deck',
    description: '10-slide pitch deck for investors with problem, solution, metrics & market size',
    icon: 'Rocket',
    themeId: 'midnight-glow',
    markdown: `<!-- layout: title -->
<!-- bg: dark -->
# Nexus AI Presentation Tool
### Reimagining Visual Presentations with Markdown & AI Automation

Prepared for Seed Round Investors
<!-- notes: Welcome everyone. Today I am excited to introduce Nexus AI, the future of visual slides created directly from simple Markdown. -->

---

<!-- layout: split -->
## The Problem
### Visual slide creation is broken & time-consuming

- **Overwhelming Design Complexity**: Hours wasted aligning text boxes and tweaking margins
- **Tool Fragmentation**: Switching between Google Docs, Figma, and PowerPoint
- **Inconsistent Branding**: Format breaks across devices and multi-author teams
- **Slow Iteration Speed**: Updating a single number requires manual layout fixes

---

<!-- layout: stats -->
## Market Opportunity
### Massive TAM across enterprise and creator economy

> **$14.2B** Global Presentation Software Market Size by 2028

> **120M+** Daily Active Google Workspace & Slides Users

> **4.8x** Faster Slide Deck Creation with Markdown Workflows

---

<!-- layout: grid -->
## Our Solution
### Markdown Simplicity + AI Visual Layout Engine

::: Column 1
### Simple Markdown Input
Write pure content in plain text. Focus on ideas rather than pixel pushing.

::: Column 2
### AI Layout Automation
Instant auto-formatting into visual stats, comparison grids, and hero cards.

::: Column 3
### Google Slides Sync
One-click direct export to native Google Slides with full editability.

---

<!-- layout: stats -->
## Traction & Growth
### Strong early organic adoption across tech teams

> **85,000+** Active Monthly Slide Creators

> **98%** Customer Satisfaction & NPS Score

> **$1.8M** Annual Recurring Revenue (3x YoY Growth)

---

<!-- layout: split -->
## Product Architecture
### Full-stack performance with real-time preview

- **Client-Side Visual Canvas**: Instant HMR rendering at 60 FPS
- **Gemini 3.7 AI Assistant**: Auto-generates slides, summaries, and speaker notes
- **Google Workspace API**: Seamless OAuth 2.0 integration with Google Slides
- **Export Versatility**: Export directly to PDF, Google Slides, or raw Markdown

---

<!-- layout: quote -->
## Customer Testimonials
### Loved by product leaders and founders worldwide

> "Nexus AI saved our team over 15 hours every week preparing investor updates and client presentations. The Google Slides export is magic!"
> — Sarah Lin, VP of Product at Horizon Labs

---

<!-- layout: title -->
<!-- bg: dark -->
# Join Our Journey
### Raising $3.5M Seed Round to scale engineering & GTM

Contact: founders@nexusai.io | https://nexusai.io
<!-- notes: Thank you for your time. We welcome your questions! -->`,
  },
  {
    id: 'qbr-report',
    name: 'Quarterly Business Review (QBR)',
    description: 'Executive quarterly review deck with KPIs, milestones, and strategic roadmap',
    icon: 'BarChart3',
    themeId: 'modern-slate',
    markdown: `<!-- layout: title -->
# Q3 Executive Business Review
### Performance Highlights, KPIs & Future Growth Roadmap

Presented by Executive Leadership Team
<!-- notes: Good morning team. Let's dive into our Q3 performance results and strategic alignment for Q4. -->

---

<!-- layout: stats -->
## Q3 Financial Overview
### Record quarterly revenue and expanded operating margin

> **$4.2M** Q3 Total Revenue (+34% YoY)

> **82%** Gross Profit Margin

> **112%** Net Revenue Retention Rate

---

<!-- layout: split -->
## Key Accomplishments
### Exceeded product & sales milestones in Q3

- **Enterprise Launch**: Closed 12 major Fortune 500 enterprise accounts
- **AI Feature Suite**: Released automated slide generation powered by Gemini
- **Infrastructure Upgrade**: Reduced server latency by 45% globally
- **Team Expansion**: Onboarded 8 senior engineers and key account executives

---

<!-- layout: grid -->
## Strategic Focus Areas for Q4
### Three core pillars driving our next growth phase

::: Product Innovation
Launch Google Drive asset integration and real-time multiplayer co-editing.

::: Enterprise Security
Complete SOC2 Type II compliance and single sign-on (SSO) integration.

::: Market Expansion
Expand localization support across EMEA and APAC regions.

---

<!-- layout: quote -->
## Leadership Perspective
### Moving fast while maintaining product excellence

> "Our focus on developer experience and visual clarity is proving to be our strongest competitive moat in a crowded market."
> — Chief Executive Officer`,
  },
  {
    id: 'tech-architecture',
    name: 'Tech & Architecture Demo',
    description: 'Technical slide deck with code snippets, architecture diagrams & benchmarks',
    icon: 'Code2',
    themeId: 'cyber-dark',
    markdown: `<!-- layout: title -->
<!-- bg: dark -->
# Modern Full-Stack Architecture
### Building Scalable AI-Powered Web Applications with Express & Vite

Technical Tech Talk
<!-- notes: Today we explore the architecture powering fast fullstack applications with Gemini AI. -->

---

<!-- layout: code -->
## Server API Route
### Express route handling Gemini slide generation

\`\`\`ts
import { GoogleGenAI } from "@google/genai";

app.post("/api/gemini/generate-slides", async (req, res) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3.7-flash",
    contents: req.body.prompt,
  });
  res.json({ markdown: response.text });
});
\`\`\`

---

<!-- layout: stats -->
## Performance Benchmarks
### Lightning fast execution metrics

> **< 120ms** Initial Server Response Latency

> **60 FPS** Client-side React rendering rate

> **100/100** Lighthouse Performance Score`,
  },
  {
    id: 'warm-course',
    name: 'Educational Workshop',
    description: 'Clean serif editorial style for lectures, courses & workshops',
    icon: 'BookOpen',
    themeId: 'warm-editorial',
    markdown: `<!-- layout: title -->
# The Art of Visual Storytelling
### Mastering Slide Design, Typography & Logical Structure

Workshop Module 1
<!-- notes: Welcome students. Let's learn how to communicate complex ideas with minimal visual clutter. -->

---

<!-- layout: split -->
## Core Principles
### Design rules for memorable presentations

- **Rule 1: One Idea Per Slide**: Avoid cluttering slides with competing messages
- **Rule 2: Visual Hierarchy**: Use bold size contrasts to guide reader eye movement
- **Rule 3: Concise Copywriting**: Cut unnecessary words; embrace negative space
- **Rule 4: Purposeful Color**: Use accent colors only for key data points and takeaways`,
  },
];
