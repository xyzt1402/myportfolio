import { motion } from 'motion/react';
import { ExternalLink, Github, Tag } from 'lucide-react';
import { Dialog, Tooltip } from '../ui';

interface Project {
    title: string;
    description: string;
    details: string;
    tags: string[];
    github?: string;
    demo?: string;
}

const projects: Project[] = [
    {
        title: 'ERP System',
        description: 'React Native mobile app with 99% code sharing',
        details: 'Developed a cross-platform ERP mobile application with 99% shared codebase using React Native, reducing development time and maintaining feature parity across iOS and Android.',
        tags: ['React Native', 'TypeScript', 'Redux'],
        github: '#',
    },
    {
        title: 'PigData Platform',
        description: 'WebSockets and real-time monitoring using ECharts',
        details: 'Implemented real-time data streaming and visualization using WebSockets and ECharts to monitor agricultural metrics, enabling instant alerts and improved decision-making.',
        tags: ['WebSockets', 'ECharts', 'React'],
        demo: '#',
    },
    {
        title: 'UBank CloudTrail',
        description: 'AWS CloudTrail integration for anomaly detection',
        details: 'Integrated AWS CloudTrail with custom anomaly detection logic to track and respond to suspicious activities in banking environments.',
        tags: ['AWS', 'CloudTrail', 'TypeScript'],
    },
];

const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1 },
};

const Projects: React.FC = () => {
    return (
        <section id="projects" className="ds-section" style={{ background: 'var(--ds-bg-subtle)' }}>
            <div className="ds-container-md">
                {/* Section header */}
                <motion.div
                    className="text-center mb-12"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-80px' }}
                    variants={cardVariants}
                    transition={{ duration: 0.5 }}
                >
                    <span className="ds-badge ds-badge-brand mb-3">Portfolio</span>
                    <h2 className="ds-heading-3 mt-2" style={{ color: 'var(--ds-text)' }}>
                        Featured Projects
                    </h2>
                    <p className="ds-body mt-2 max-w-md mx-auto">
                        A selection of projects that showcase my technical range and impact.
                    </p>
                </motion.div>

                {/* Project grid */}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project, i) => (
                        <Dialog
                            key={project.title}
                            title={project.title}
                            description={project.description}
                            trigger={
                                <motion.div
                                    className="ds-card ds-card-interactive p-6 flex flex-col justify-between cursor-pointer h-full"
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: '-60px' }}
                                    variants={cardVariants}
                                    transition={{ duration: 0.4, delay: i * 0.1 }}
                                    whileHover={{ y: -4 }}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div>
                                        <h3
                                            className="text-lg font-semibold mb-2"
                                            style={{ color: 'var(--ds-text)' }}
                                        >
                                            {project.title}
                                        </h3>
                                        <p
                                            className="text-sm leading-relaxed mb-4"
                                            style={{ color: 'var(--ds-text-subtle)' }}
                                        >
                                            {project.description}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map((tag) => (
                                            <span key={tag} className="ds-badge ds-badge-brand">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            }
                        >
                            {/* Dialog body */}
                            <div className="space-y-4">
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--ds-text-subtle)' }}>
                                    {project.details}
                                </p>

                                {/* Tags with tooltips */}
                                <div>
                                    <p
                                        className="text-xs font-medium mb-2 flex items-center gap-1"
                                        style={{ color: 'var(--ds-text-muted)' }}
                                    >
                                        <Tag className="w-3 h-3" />
                                        Technologies
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map((tag) => (
                                            <Tooltip key={tag} content={`View projects using ${tag}`}>
                                                <span className="ds-badge ds-badge-brand cursor-default">
                                                    {tag}
                                                </span>
                                            </Tooltip>
                                        ))}
                                    </div>
                                </div>

                                {/* Links */}
                                {(project.github || project.demo) && (
                                    <div className="flex gap-3 pt-2">
                                        {project.github && (
                                            <a
                                                href={project.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ds-btn ds-btn-ghost ds-btn-sm flex items-center gap-1.5"
                                            >
                                                <Github className="w-3.5 h-3.5" />
                                                Source
                                            </a>
                                        )}
                                        {project.demo && (
                                            <a
                                                href={project.demo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ds-btn ds-btn-secondary ds-btn-sm flex items-center gap-1.5"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                Live Demo
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Dialog>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Projects;
