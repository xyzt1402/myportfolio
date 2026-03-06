import { motion } from 'motion/react';
import { Briefcase, Calendar, MapPin } from 'lucide-react';
import * as Separator from '@radix-ui/react-separator';

interface TimelineEntry {
    company: string;
    role: string;
    period: string;
    location?: string;
    description: string;
    tags?: string[];
    current?: boolean;
}

const entries: TimelineEntry[] = [
    {
        company: 'FPT Software',
        role: 'Frontend Lead',
        period: '2022 – Present',
        location: 'Ho Chi Minh City',
        description: 'Code optimization, technical mentorship, and leading a team of 4–6 engineers. Driving architecture decisions and best practices across multiple product lines.',
        tags: ['React', 'TypeScript', 'Next.js', 'Team Lead'],
        current: true,
    },
    {
        company: 'THD Cyber Security',
        role: 'Frontend Engineer',
        period: '2020 – 2022',
        location: 'Ho Chi Minh City',
        description: 'Built observability & fraud detection platforms. Implemented real-time dashboards with WebSockets and ECharts for monitoring banking anomalies.',
        tags: ['React', 'WebSockets', 'ECharts', 'AWS'],
    },
];

const entryVariants = {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0 },
};

const Timeline: React.FC = () => {
    return (
        <section id="experience" className="ds-section" style={{ background: 'var(--ds-bg)' }}>
            <div className="ds-container-sm">
                {/* Section header */}
                <motion.div
                    className="text-center mb-12"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    variants={entryVariants}
                    transition={{ duration: 0.5 }}
                >
                    <span className="ds-badge ds-badge-brand mb-3">Career</span>
                    <h2 className="ds-heading-3 mt-2" style={{ color: 'var(--ds-text)' }}>
                        Work Experience
                    </h2>
                </motion.div>

                {/* Timeline */}
                <div className="relative">
                    {/* Vertical line */}
                    <div
                        className="absolute left-5 top-0 bottom-0 w-px"
                        style={{ background: 'var(--ds-border-brand)' }}
                        aria-hidden="true"
                    />

                    <div className="space-y-8 pl-14">
                        {entries.map((entry, i) => (
                            <motion.div
                                key={entry.company}
                                className="relative"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-60px' }}
                                variants={entryVariants}
                                transition={{ duration: 0.5, delay: i * 0.15 }}
                            >
                                {/* Timeline dot - positioned relative to the entry, not using marginTop calculation */}
                                <div
                                    className="absolute -left-14 top-6 flex items-center justify-center w-10 h-10 rounded-full border-2"
                                    style={{
                                        background: entry.current ? 'var(--ds-accent-subtle)' : 'var(--ds-bg-muted)',
                                        borderColor: entry.current ? 'var(--ds-accent)' : 'var(--ds-border)',
                                    }}
                                >
                                    <Briefcase
                                        className="w-4 h-4"
                                        style={{ color: entry.current ? 'var(--ds-accent-text)' : 'var(--ds-text-muted)' }}
                                    />
                                </div>

                                {/* Card */}
                                <div className="ds-card p-6">
                                    {/* Header */}
                                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3
                                                    className="text-lg font-semibold"
                                                    style={{ color: 'var(--ds-text)' }}
                                                >
                                                    {entry.company}
                                                </h3>
                                                {entry.current && (
                                                    <span className="ds-badge ds-badge-brand">Current</span>
                                                )}
                                            </div>
                                            <p
                                                className="text-sm font-medium mt-0.5"
                                                style={{ color: 'var(--ds-accent-text)' }}
                                            >
                                                {entry.role}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-1 text-xs" style={{ color: 'var(--ds-text-muted)' }}>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {entry.period}
                                            </span>
                                            {entry.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {entry.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <Separator.Root
                                        className="ds-separator"
                                        style={{ marginBlock: 'var(--ds-space-3)' }}
                                    />

                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--ds-text-subtle)' }}>
                                        {entry.description}
                                    </p>

                                    {entry.tags && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {entry.tags.map((tag) => (
                                                <span key={tag} className="ds-badge ds-badge-neutral">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Timeline;
