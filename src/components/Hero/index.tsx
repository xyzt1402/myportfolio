import { motion } from 'motion/react';
import { Mail, Download, Github, Linkedin } from 'lucide-react';
import Button from '../ui/Button';

const Hero: React.FC = () => {
    return (
        <section
            id="hero"
            className="relative flex flex-col items-center justify-center text-center min-h-[80vh] px-4 overflow-hidden"
            style={{ background: 'var(--ds-bg)' }}
        >
            {/* Background gradient blob */}
            <div
                className="absolute inset-0 pointer-events-none"
                aria-hidden="true"
            >
                <div
                    className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
                    style={{ background: 'radial-gradient(circle, var(--color-brand-400), transparent 70%)' }}
                />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto">
                {/* Availability badge */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="inline-flex items-center gap-2 mb-6"
                >
                    <span className="ds-badge ds-badge-brand">
                        <span
                            className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--ds-accent)] mr-1.5 ds-animate-pulse-glow"
                            aria-hidden="true"
                        />
                        Available for opportunities
                    </span>
                </motion.div>

                {/* Name */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-3"
                    style={{ color: 'var(--ds-text)' }}
                >
                    Lê Thanh Việt
                </motion.h1>

                {/* Title */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-xl sm:text-2xl font-semibold mb-4 ds-gradient-text-brand"
                >
                    Frontend Lead
                </motion.p>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed"
                    style={{ color: 'var(--ds-text-subtle)' }}
                >
                    Specializing in secure, scalable, and high-performance web
                    applications. 4+ years building production React & TypeScript systems.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-3 justify-center items-center"
                >
                    <Button
                        variant="primary"
                        size="lg"
                        asChild
                    >
                        <a href="mailto:xyzt1402@gmail.com">
                            <Mail className="w-4 h-4" />
                            Get in Touch
                        </a>
                    </Button>

                    <Button
                        variant="secondary"
                        size="lg"
                        asChild
                    >
                        <a href="/resume.pdf" download>
                            <Download className="w-4 h-4" />
                            Download CV
                        </a>
                    </Button>
                </motion.div>

                {/* Social links */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="flex items-center justify-center gap-4 mt-8"
                >
                    <a
                        href="https://github.com/xyzt1402"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ds-btn ds-btn-ghost ds-btn-icon"
                        aria-label="GitHub"
                    >
                        <Github className="w-5 h-5" />
                    </a>
                    <a
                        href="https://linkedin.com/in/việt-lê-thanh-a22708238/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ds-btn ds-btn-ghost ds-btn-icon"
                        aria-label="LinkedIn"
                    >
                        <Linkedin className="w-5 h-5" />
                    </a>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
