/**
 * Knowledge base for ChatLTV — a Gemini-like chat interface that answers
 * questions about Lê Thanh Việt's professional background.
 *
 * The bot uses keyword matching to find the best response.
 * Keywords are matched with priority: longer/more-specific keywords score higher.
 * Each entry also has an optional `priority` boost to break ties.
 */

export interface KnowledgeEntry {
    keywords: string[];
    response: string;
    /** Optional priority boost (default 0). Higher = preferred when scores tie. */
    priority?: number;
}

export const PERSONA_NAME = 'LTV';
export const PERSONA_FULL_NAME = 'Lê Thanh Việt';

export const GREETING_MESSAGE = `Hi! I'm **LTV**, an AI assistant representing **Lê Thanh Việt** — a Frontend Lead with 4+ years of experience building production-grade React & TypeScript systems.

Ask me anything about his background, skills, projects, or experience. I'm here to help! 🚀`;

export const FALLBACK_RESPONSE = `I'm not sure I have specific information about that. You can ask me about:

- **Work experience** at FPT Software or THD Cyber Security
- **Technical skills** like React, TypeScript, Next.js, WebSockets
- **Projects** like ERP System, PigData Platform, or UBank CloudTrail
- **Education** and background
- **Contact** information

Feel free to rephrase your question!`;

export const knowledgeBase: KnowledgeEntry[] = [
    // Identity / General
    {
        keywords: ['who are you', 'about yourself', 'introduce yourself', 'tell me about yourself', 'who is ltv', 'who is viet', 'who is việt'],
        priority: 2,
        response: `**Lê Thanh Việt** (LTV) is a **Frontend Lead** based in Ho Chi Minh City, Vietnam.

He has **4+ years** of professional experience building secure, scalable, and high-performance web applications. He specializes in **React**, **TypeScript**, and modern frontend architecture.

Currently leading a team of 4–6 engineers at **FPT Software**, he drives architecture decisions, code quality, and technical mentorship across multiple product lines.`,
    },

    // Identity fallback (single keywords)
    {
        keywords: ['ltv', 'viet', 'việt', 'thanh', 'introduce', 'yourself'],
        response: `**Lê Thanh Việt** (LTV) is a **Frontend Lead** based in Ho Chi Minh City, Vietnam.

He has **4+ years** of professional experience building secure, scalable, and high-performance web applications. He specializes in **React**, **TypeScript**, and modern frontend architecture.

Currently leading a team of 4–6 engineers at **FPT Software**, he drives architecture decisions, code quality, and technical mentorship across multiple product lines.`,
    },

    // Current role / FPT Software
    {
        keywords: ['fpt software', 'current role', 'current job', 'current company', 'frontend lead'],
        priority: 2,
        response: `**Frontend Lead @ FPT Software** *(2022 – Present)*
📍 Ho Chi Minh City

At FPT Software, Việt:
- Leads a team of **4–6 frontend engineers**
- Drives **architecture decisions** and enforces best practices across multiple product lines
- Performs **code optimization** and technical mentorship
- Works with **React**, **TypeScript**, and **Next.js** at scale

This is his current role where he continues to grow as a technical leader.`,
    },

    // Current role fallback
    {
        keywords: ['fpt', 'current', 'present', 'company', 'employer'],
        response: `**Frontend Lead @ FPT Software** *(2022 – Present)*
📍 Ho Chi Minh City

At FPT Software, Việt:
- Leads a team of **4–6 frontend engineers**
- Drives **architecture decisions** and enforces best practices across multiple product lines
- Performs **code optimization** and technical mentorship
- Works with **React**, **TypeScript**, and **Next.js** at scale

This is his current role where he continues to grow as a technical leader.`,
    },

    // THD Cyber Security
    {
        keywords: ['thd', 'cyber security', 'fraud detection', 'banking anomaly', 'previous job', 'previous role', 'past job'],
        priority: 2,
        response: `**Frontend Engineer @ THD Cyber Security** *(2020 – 2022)*
📍 Ho Chi Minh City

At THD Cyber Security, Việt:
- Built **observability & fraud detection platforms** for banking clients
- Implemented **real-time dashboards** using WebSockets and ECharts
- Monitored banking anomalies with live data streaming
- Worked with **React**, **WebSockets**, **ECharts**, and **AWS**

This role gave him deep expertise in real-time data visualization and security-focused frontend systems.`,
    },

    // THD fallback
    {
        keywords: ['cyber', 'security', 'fraud', 'banking', 'anomaly', 'previous', 'before', 'past'],
        response: `**Frontend Engineer @ THD Cyber Security** *(2020 – 2022)*
📍 Ho Chi Minh City

At THD Cyber Security, Việt:
- Built **observability & fraud detection platforms** for banking clients
- Implemented **real-time dashboards** using WebSockets and ECharts
- Monitored banking anomalies with live data streaming
- Worked with **React**, **WebSockets**, **ECharts**, and **AWS**

This role gave him deep expertise in real-time data visualization and security-focused frontend systems.`,
    },

    // Skills / Tech stack
    {
        keywords: ['technical skills', 'tech stack', 'what technologies', 'what tools', 'what languages', 'what frameworks'],
        priority: 2,
        response: `**Technical Skills**

**Frontend Core**
- React, React Native, Next.js
- TypeScript, JavaScript (ES2022+)
- HTML5, CSS3, Tailwind CSS

**State & Data**
- Redux, Zustand, React Query
- WebSockets, REST APIs, GraphQL

**Cloud & DevOps**
- AWS (CloudTrail, S3, Lambda)
- Docker, CI/CD pipelines

**Visualization**
- ECharts, D3.js, Chart.js

**Tools**
- Git, Vite, Webpack, ESLint
- Figma (design collaboration)`,
    },

    // Skills fallback
    {
        keywords: ['skill', 'stack', 'technology', 'language', 'framework', 'tool', 'expertise', 'know'],
        response: `**Technical Skills**

**Frontend Core**
- React, React Native, Next.js
- TypeScript, JavaScript (ES2022+)
- HTML5, CSS3, Tailwind CSS

**State & Data**
- Redux, Zustand, React Query
- WebSockets, REST APIs, GraphQL

**Cloud & DevOps**
- AWS (CloudTrail, S3, Lambda)
- Docker, CI/CD pipelines

**Visualization**
- ECharts, D3.js, Chart.js

**Tools**
- Git, Vite, Webpack, ESLint
- Figma (design collaboration)`,
    },

    // React / TypeScript specific
    {
        keywords: ['react', 'typescript', 'nextjs', 'next.js', 'javascript'],
        response: `Việt is highly proficient in **React** and **TypeScript** — these are his primary tools.

**React expertise includes:**
- Component architecture & design patterns
- Performance optimization (memoization, code splitting, lazy loading)
- Custom hooks and context management
- React Native for cross-platform mobile apps

**TypeScript expertise includes:**
- Strict typing and advanced generics
- Type-safe API integration
- Shared type definitions across monorepos

He's been using React professionally since 2020 and TypeScript since 2021.`,
    },

    // Projects — high priority, specific multi-word keywords
    {
        keywords: ['show me projects', 'what projects', 'his projects', 'worked on', 'has built', 'has made', 'portfolio projects', 'featured projects'],
        priority: 3,
        response: `**Featured Projects**

**1. ERP System** — React Native
Cross-platform mobile ERP app with **99% code sharing** between iOS and Android. Built with React Native, TypeScript, and Redux.

**2. PigData Platform** — Real-time Monitoring
Agricultural data monitoring platform with **WebSockets** and **ECharts** for real-time visualization. Enabled instant alerts and improved decision-making.

**3. UBank CloudTrail** — Security
**AWS CloudTrail** integration with custom anomaly detection logic for tracking suspicious activities in banking environments.

Want to know more about any specific project?`,
    },

    // Projects fallback
    {
        keywords: ['project', 'portfolio', 'built', 'build', 'made', 'created'],
        priority: 1,
        response: `**Featured Projects**

**1. ERP System** — React Native
Cross-platform mobile ERP app with **99% code sharing** between iOS and Android. Built with React Native, TypeScript, and Redux.

**2. PigData Platform** — Real-time Monitoring
Agricultural data monitoring platform with **WebSockets** and **ECharts** for real-time visualization. Enabled instant alerts and improved decision-making.

**3. UBank CloudTrail** — Security
**AWS CloudTrail** integration with custom anomaly detection logic for tracking suspicious activities in banking environments.

Want to know more about any specific project?`,
    },

    // ERP project
    {
        keywords: ['erp', 'mobile', 'react native', 'cross-platform', 'ios', 'android'],
        response: `**ERP System — React Native**

A cross-platform enterprise resource planning mobile application featuring:
- **99% shared codebase** between iOS and Android
- Built with **React Native**, **TypeScript**, and **Redux**
- Significantly reduced development time while maintaining feature parity
- Handled complex business logic for enterprise workflows

This project demonstrated Việt's ability to deliver production-quality mobile apps with maximum code reuse.`,
    },

    // PigData project
    {
        keywords: ['pigdata', 'pig', 'agricultural', 'websocket', 'echart', 'real-time', 'realtime', 'monitoring'],
        response: `**PigData Platform — Real-time Monitoring**

An agricultural data monitoring platform featuring:
- **Real-time data streaming** via WebSockets
- **ECharts** visualizations for live metric dashboards
- Instant alert system for anomaly detection
- Improved decision-making for agricultural operations

This project showcased Việt's expertise in real-time frontend systems and data visualization.`,
    },

    // UBank project
    {
        keywords: ['ubank', 'cloudtrail', 'aws', 'cloud', 'banking', 'detection'],
        response: `**UBank CloudTrail — Security Platform**

A banking security platform featuring:
- **AWS CloudTrail** integration for comprehensive audit logging
- Custom **anomaly detection** logic for suspicious activity
- Real-time monitoring of banking environment events
- TypeScript-based frontend with secure data handling

This project reflects Việt's experience at the intersection of frontend development and cybersecurity.`,
    },

    // Experience / years
    {
        keywords: ['experience', 'year', 'long', 'how long', 'senior', 'junior', 'level'],
        response: `Việt has **4+ years** of professional frontend development experience:

- **2020–2022**: Frontend Engineer at THD Cyber Security
- **2022–Present**: Frontend Lead at FPT Software

He progressed from engineer to **team lead** within 2 years, demonstrating strong technical and leadership growth. He's considered a **senior-level** engineer with team leadership responsibilities.`,
    },

    // Location
    {
        keywords: ['location', 'where', 'city', 'country', 'vietnam', 'ho chi minh', 'hcmc', 'saigon', 'based'],
        response: `Việt is based in **Ho Chi Minh City, Vietnam** 🇻🇳

He has worked at companies in Ho Chi Minh City throughout his career:
- FPT Software (current)
- THD Cyber Security (previous)

He is open to **remote opportunities** and international collaboration.`,
    },

    // Contact
    {
        keywords: ['contact', 'email', 'reach', 'hire', 'available', 'opportunity', 'connect', 'linkedin', 'github'],
        response: `**Get in Touch with Việt**

📧 **Email**: xyzt1402@gmail.com
💼 **LinkedIn**: linkedin.com/in/vi%E1%BB%87t-l%C3%AA-thanh-a22708238/
🐙 **GitHub**: github.com/xyzt1402

He is currently **available for new opportunities** — whether that's a senior frontend role, a team lead position, or an interesting freelance project.

Feel free to reach out directly!`,
    },

    // Education
    {
        keywords: ['education', 'university', 'degree', 'study', 'school', 'college', 'graduate'],
        response: `Việt studied **Computer Science / Software Engineering** in Vietnam.

His practical skills were largely developed through:
- Professional work experience (4+ years)
- Self-directed learning and open-source contributions
- Building real-world production systems

He believes in continuous learning and stays current with the latest frontend ecosystem developments.`,
    },

    // Leadership / management
    {
        keywords: ['lead', 'leadership', 'manage', 'team', 'mentor', 'architect', 'decision'],
        response: `**Leadership & Team Management**

As **Frontend Lead at FPT Software**, Việt:
- Manages a team of **4–6 frontend engineers**
- Conducts **code reviews** and enforces quality standards
- Provides **technical mentorship** to junior and mid-level developers
- Makes **architecture decisions** for multiple product lines
- Facilitates sprint planning and technical discussions

He transitioned into a leadership role in 2022 and has been growing his team management skills alongside his technical expertise.`,
    },

    // Performance / optimization
    {
        keywords: ['performance', 'optimization', 'optimize', 'fast', 'speed', 'bundle', 'lazy'],
        response: `**Performance Optimization**

Việt has strong expertise in frontend performance:
- **Code splitting** and lazy loading with React.lazy & Suspense
- **Bundle optimization** with Vite/Webpack
- **Memoization** strategies (useMemo, useCallback, React.memo)
- **Virtual scrolling** for large data sets
- **WebSocket** optimization for real-time data streams
- **Image optimization** and asset management

At FPT Software, code optimization is one of his primary responsibilities.`,
    },

    // Availability / hiring
    {
        keywords: ['hire', 'hiring', 'available', 'open to', 'looking', 'job', 'position', 'role', 'opportunity'],
        response: `✅ **Việt is currently available for opportunities!**

He's open to:
- **Senior Frontend Engineer** roles
- **Frontend Lead / Tech Lead** positions
- **Remote-first** companies
- Interesting **startup** or **scale-up** environments

**Preferred stack**: React, TypeScript, Next.js

📧 Reach him at: **xyzt1402@gmail.com**`,
    },
];

/**
 * Find the best matching response for a given user query.
 *
 * Scoring rules:
 *  - Multi-word keyword match: +3 × word count (phrase matches are very specific)
 *  - Single-word keyword match: +1
 *  - Entry `priority` boost is added on top of keyword score
 *
 * The entry with the highest total score wins.
 */
export function findResponse(query: string): string {
    const normalized = query.toLowerCase().trim();

    let bestScore = 0;
    let bestResponse = FALLBACK_RESPONSE;

    for (const entry of knowledgeBase) {
        let score = 0;
        for (const keyword of entry.keywords) {
            if (normalized.includes(keyword)) {
                const wordCount = keyword.split(/\s+/).length;
                // Multi-word phrases score much higher than single words
                score += wordCount > 1 ? wordCount * 3 : 1;
            }
        }

        if (score > 0) {
            // Apply priority boost
            score += (entry.priority ?? 0);
        }

        if (score > bestScore) {
            bestScore = score;
            bestResponse = entry.response;
        }
    }

    return bestResponse;
}

/** Suggested starter prompts shown on the empty state */
export const SUGGESTED_PROMPTS = [
    { label: 'Tell me about yourself', icon: '👋' },
    { label: 'What is your current role?', icon: '💼' },
    { label: 'What are your technical skills?', icon: '⚡' },
    { label: 'Show me your projects', icon: '🚀' },
    { label: 'Are you available for hire?', icon: '✅' },
    { label: 'Where are you located?', icon: '📍' },
];
