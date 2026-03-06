/**
 * Home Page Tests
 *
 * Tests the main landing page renders all sections correctly.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Home from '../pages/Home';
import '@testing-library/jest-dom/vitest';

describe('Home Page', () => {
    afterEach(() => {
        cleanup();
    });

    it('should render the home page without crashing', () => {
        render(<Home />);
        expect(document.body).toBeTruthy();
    });

    it('should render hero section with name', () => {
        render(<Home />);
        expect(screen.getByText('Lê Thanh Việt')).toBeInTheDocument();
    });

    it('should render all main sections', () => {
        render(<Home />);

        // Hero section content - use getAllByText since "Frontend Lead" appears in multiple places
        expect(screen.getAllByText(/Frontend Lead/i).length).toBeGreaterThan(0);

        // Skills section
        expect(screen.getByText(/Technical skills/i)).toBeInTheDocument();

        // Projects section
        expect(screen.getByText(/Featured Projects/i)).toBeInTheDocument();

        // Footer - name appears multiple times
        expect(screen.getAllByText(/Lê Thanh Việt/i).length).toBeGreaterThan(0);
    });

    it('should have navigation links', () => {
        render(<Home />);

        // Check for navigation by role or text content
        expect(screen.getByText(/Experience/i)).toBeInTheDocument();
    });

    it('should render social links', () => {
        render(<Home />);

        // Check for social links by aria-label - use getAllBy since there may be multiple
        const githubLinks = screen.getAllByRole('link', { name: /GitHub/i });
        const linkedinLinks = screen.getAllByRole('link', { name: /LinkedIn/i });

        expect(githubLinks.length).toBeGreaterThan(0);
        expect(linkedinLinks.length).toBeGreaterThan(0);
    });
});
