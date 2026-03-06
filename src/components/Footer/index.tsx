import { motion } from 'motion/react';
import { Mail, Phone, Github, Linkedin } from 'lucide-react';
import * as Separator from '@radix-ui/react-separator';

const Footer: React.FC = () => {
    const year = new Date().getFullYear();

    return (
        <footer
            id="contact"
            style={{ background: 'var(--ds-bg-subtle)', borderTop: '1px solid var(--ds-border)' }}
        >
            <div className="ds-container ds-section-sm">
                <motion.div
                    className="flex flex-col items-center justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Contact */}
                    <div className="text-center">
                        <div className="flex items-center gap-2 mb-3 justify-center">
                            <Mail
                                className="w-4 h-4"
                                style={{ color: 'var(--ds-accent-text)' }}
                            />
                            <h4 className="text-sm font-semibold" style={{ color: 'var(--ds-text)' }}>
                                Contact
                            </h4>
                        </div>
                        <a
                            href="mailto:xyzt1402@gmail.com"
                            className="text-sm block hover:underline"
                            style={{ color: 'var(--ds-text-subtle)' }}
                        >
                            xyzt1402@gmail.com
                        </a>
                        <a
                            href="tel:+84914953936"
                            className="text-sm flex items-center gap-1 mt-1 hover:underline justify-center"
                            style={{ color: 'var(--ds-text-subtle)' }}
                        >
                            <Phone className="w-3 h-3" />
                            0914 953 936
                        </a>
                    </div>
                </motion.div>

                <Separator.Root className="ds-separator" />

                {/* Bottom bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                    <p className="text-xs" style={{ color: 'var(--ds-text-muted)' }}>
                        © {year} Lê Thanh Việt · Built with React & TypeScript
                    </p>

                    <div className="flex items-center gap-3">
                        <a
                            href="https://github.com/xyzt1402"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ds-btn ds-btn-ghost ds-btn-icon"
                            aria-label="GitHub"
                        >
                            <Github className="w-4 h-4" />
                        </a>
                        <a
                            href="https://linkedin.com/in/việt-lê-thanh-a22708238/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ds-btn ds-btn-ghost ds-btn-icon"
                            aria-label="LinkedIn"
                        >
                            <Linkedin className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
