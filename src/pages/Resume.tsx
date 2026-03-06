import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import SkillsGrid from '../components/SkillsGrid';
import Timeline from '../components/Timeline';
import Projects from '../components/Projects';
import Footer from '../components/Footer';
import Education from '../components/Education';
import ScrollIndicator from '../components/ScrollIndicator';

/**
 * Resume page replaces the former Home page and assembles all of the
 * individual sections defined in components.  Having a single page
 * with hero, skills, experience, projects, and footer mirrors the
 * provided UI mockup.
 */
const Resume: React.FC = () => {
    useEffect(() => {
        // fetch('/api/resume').then(r => r.json()).then(setResumeData);
    }, []);

    return (
        <>
            <Hero />
            <SkillsGrid />
            <Education />
            <Timeline />
            <Projects />
            <Footer />
            <ScrollIndicator />
        </>
    );
};

export default Resume;
