import React from 'react';
import Hero from '../components/Hero';
import SkillsGrid from '../components/SkillsGrid';
import Education from '../components/Education';
import Timeline from '../components/Timeline';
import Projects from '../components/Projects';
import Footer from '../components/Footer';

/**
 * Home page renders all of the primary sections in the high‑fidelity
 * mockup. Each section lives in its own component to keep the file
 * manageable and to allow easy API integration later.
 */
const Home: React.FC = () => {
    return (
        <>
            <Hero />
            <SkillsGrid />
            <Education />
            <Timeline />
            <Projects />
            <Footer />
        </>
    );
};

export default Home;
