import { motion } from 'motion/react';
import { Code, Lock, Server, Layers, Rocket, Globe, Database } from 'lucide-react';

interface SkillTile {
    icon: React.ElementType;
    title: string;
    subtitle?: string;
    span?: 'wide' | 'tall' | 'large' | 'normal';
}

const skills: SkillTile[] = [
    { icon: Code, title: 'React & TypeScript', subtitle: '4 years', span: 'large' },
    { icon: Layers, title: 'Tech Lead', subtitle: '3 years (4–6 team members)', span: 'wide' },
    { icon: Server, title: 'Next.js', subtitle: 'SSR / SSG', span: 'normal' },
    { icon: Rocket, title: 'GraphQL', subtitle: 'Apollo / urql', span: 'normal' },
    { icon: Code, title: 'Node.js', subtitle: 'Express / Fastify', span: 'normal' },
    { icon: Server, title: 'Docker', subtitle: 'Containerization', span: 'normal' },
    { icon: Lock, title: 'Security', subtitle: 'Academy of Cryptography', span: 'normal' },
    { icon: Globe, title: 'WebSockets', subtitle: 'Real-time systems', span: 'normal' },
    { icon: Database, title: 'AWS', subtitle: 'CloudTrail / S3 / Lambda', span: 'wide' },
];

const tileVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1 },
};

const SkillsGrid: React.FC = () => {
    return (
        <section id="expertise" className="ds-section" style={{ background: 'var(--ds-bg-subtle)' }}>
            <div className="ds-container-md">
                {/* Section header */}
                <motion.div
                    className="text-center mb-12"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    variants={tileVariants}
                    transition={{ duration: 0.5 }}
                >
                    <span className="ds-badge ds-badge-brand mb-3">Expertise</span>
                    <h2 className="ds-heading-3 mt-2" style={{ color: 'var(--ds-text)' }}>
                        Technical Skills
                    </h2>
                    <p className="ds-body mt-2 max-w-md mx-auto">
                        A curated overview of the technologies and practices I work with daily.
                    </p>
                </motion.div>

                {/* Bento grid */}
                <div className="grid grid-cols-4 gap-4 auto-rows-[minmax(100px,auto)]">
                    {skills.map((skill, i) => {
                        const Icon = skill.icon;
                        const colSpan = skill.span === 'large' || skill.span === 'wide' ? 'col-span-2' : 'col-span-1';
                        const rowSpan = skill.span === 'large' || skill.span === 'tall' ? 'row-span-2' : 'row-span-1';

                        return (
                            <motion.div
                                key={skill.title}
                                className={`ds-card ds-card-glass ds-card-interactive p-5 flex flex-col gap-2 ${colSpan} ${rowSpan}`}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-60px' }}
                                variants={tileVariants}
                                transition={{ duration: 0.4, delay: i * 0.06 }}
                                whileHover={{ scale: 1.02, y: -2 }}
                            >
                                <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                                    style={{ background: 'var(--ds-accent-subtle)' }}
                                >
                                    <Icon
                                        className="w-5 h-5"
                                        style={{ color: 'var(--ds-accent-text)' }}
                                    />
                                </div>
                                <div>
                                    <h3
                                        className="font-semibold text-base leading-tight"
                                        style={{ color: 'var(--ds-text)' }}
                                    >
                                        {skill.title}
                                    </h3>
                                    {skill.subtitle && (
                                        <p className="text-sm mt-0.5" style={{ color: 'var(--ds-text-subtle)' }}>
                                            {skill.subtitle}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default SkillsGrid;
