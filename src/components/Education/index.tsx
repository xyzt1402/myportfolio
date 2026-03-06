import { motion } from 'motion/react';
import { GraduationCap, Award, Calendar, MapPin } from 'lucide-react';
import * as Separator from '@radix-ui/react-separator';

interface EducationEntry {
    school: string;
    degree: string;
    period: string;
    location: string;
    details: string;
    gpa?: string;
}

interface CertificateEntry {
    name: string;
    issuer: string;
    date: string;
    score?: string;
}

const educationEntries: EducationEntry[] = [
    {
        school: 'Academy of Cryptography Techniques',
        degree: 'Information Technology',
        period: '2016 – 2020',
        location: 'Ho Chi Minh City',
        details: 'Top 4 HCM campus',
        gpa: 'GPA 3.4 / 4.0',
    },
];

const certificates: CertificateEntry[] = [
    {
        name: 'TOEIC',
        issuer: 'Educational Testing Service',
        date: '2020',
        score: '795 / 990',
    },
];

const entryVariants = {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0 },
};

const Education: React.FC = () => {
    return (
        <section id="education" className="ds-section" style={{ background: 'var(--ds-bg)' }}>
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
                    <span className="ds-badge ds-badge-brand mb-3">Background</span>
                    <h2 className="ds-heading-3 mt-2" style={{ color: 'var(--ds-text)' }}>
                        Education & Certificates
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Education Section */}
                    <div>
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-60px' }}
                            variants={entryVariants}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <GraduationCap
                                    className="w-5 h-5"
                                    style={{ color: 'var(--ds-accent-text)' }}
                                />
                                <h3 className="text-xl font-semibold" style={{ color: 'var(--ds-text)' }}>
                                    Education
                                </h3>
                            </div>

                            <div className="relative">
                                {/* Vertical line */}
                                <div
                                    className="absolute left-5 top-0 bottom-0 w-px"
                                    style={{ background: 'var(--ds-border-brand)' }}
                                    aria-hidden="true"
                                />

                                <div className="space-y-8 pl-14">
                                    {educationEntries.map((entry, i) => (
                                        <motion.div
                                            key={entry.school}
                                            className="relative"
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true, margin: '-60px' }}
                                            variants={entryVariants}
                                            transition={{ duration: 0.5, delay: i * 0.15 }}
                                        >
                                            {/* Timeline dot */}
                                            <div
                                                className="absolute -left-14 top-6 flex items-center justify-center w-10 h-10 rounded-full border-2"
                                                style={{
                                                    background: 'var(--ds-accent-subtle)',
                                                    borderColor: 'var(--ds-accent)',
                                                }}
                                            >
                                                <GraduationCap
                                                    className="w-4 h-4"
                                                    style={{ color: 'var(--ds-accent-text)' }}
                                                />
                                            </div>

                                            {/* Card */}
                                            <div className="ds-card p-6">
                                                {/* Header */}
                                                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                                                    <div>
                                                        <h4
                                                            className="text-lg font-semibold"
                                                            style={{ color: 'var(--ds-text)' }}
                                                        >
                                                            {entry.school}
                                                        </h4>
                                                        <p
                                                            className="text-sm font-medium mt-0.5"
                                                            style={{ color: 'var(--ds-accent-text)' }}
                                                        >
                                                            {entry.degree}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-col items-end gap-1 text-xs" style={{ color: 'var(--ds-text-muted)' }}>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {entry.period}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {entry.location}
                                                        </span>
                                                    </div>
                                                </div>

                                                <Separator.Root
                                                    className="ds-separator"
                                                    style={{ marginBlock: 'var(--ds-space-3)' }}
                                                />

                                                <div className="flex flex-wrap gap-3">
                                                    {entry.gpa && (
                                                        <span className="ds-badge ds-badge-neutral">
                                                            {entry.gpa}
                                                        </span>
                                                    )}
                                                    {entry.details && (
                                                        <span className="ds-badge ds-badge-neutral">
                                                            {entry.details}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Certificates Section */}
                    <div>
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-60px' }}
                            variants={entryVariants}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <Award
                                    className="w-5 h-5"
                                    style={{ color: 'var(--ds-accent-text)' }}
                                />
                                <h3 className="text-xl font-semibold" style={{ color: 'var(--ds-text)' }}>
                                    Certificates
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {certificates.map((cert, i) => (
                                    <motion.div
                                        key={cert.name}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, margin: '-60px' }}
                                        variants={entryVariants}
                                        transition={{ duration: 0.5, delay: i * 0.15 + 0.3 }}
                                    >
                                        <div className="ds-card p-5">
                                            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                                <div>
                                                    <h4
                                                        className="text-base font-semibold"
                                                        style={{ color: 'var(--ds-text)' }}
                                                    >
                                                        {cert.name}
                                                    </h4>
                                                    <p
                                                        className="text-sm"
                                                        style={{ color: 'var(--ds-text-subtle)' }}
                                                    >
                                                        {cert.issuer}
                                                    </p>
                                                </div>

                                                <span className="text-xs flex items-center gap-1" style={{ color: 'var(--ds-text-muted)' }}>
                                                    <Calendar className="w-3 h-3" />
                                                    {cert.date}
                                                </span>
                                            </div>

                                            {cert.score && (
                                                <div className="mt-3">
                                                    <span className="ds-badge ds-badge-brand">
                                                        {cert.score}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Education;
