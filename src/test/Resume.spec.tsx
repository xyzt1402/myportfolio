/**
 * Resume Page Tests
 *
 * Tests the resume page renders correctly with scroll indicator.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Resume from '../pages/Resume';
import '@testing-library/jest-dom/vitest';

describe('Resume Page', () => {
    afterEach(() => {
        cleanup();
    });

    it('should render the resume page without crashing', () => {
        render(<Resume />);
        expect(document.body).toBeTruthy();
    });

    it('should render hero section with name', () => {
        render(<Resume />);
        // Use heading role to get the main name heading
        const nameHeading = screen.getByRole('heading', { name: 'Lê Thanh Việt', level: 1 });
        expect(nameHeading).toBeInTheDocument();
    });

    it('should render all content sections', () => {
        render(<Resume />);

        // Skills section - look for specific heading
        expect(screen.getByText(/Technical skills/i)).toBeInTheDocument();

        // Education section - use getAllBy since "Education" appears in multiple places
        expect(screen.getAllByText(/Education/i).length).toBeGreaterThan(0);

        // Experience/Timeline section
        expect(screen.getByText(/Work Experience/i)).toBeInTheDocument();

        // Projects section
        expect(screen.getByText(/Featured Projects/i)).toBeInTheDocument();
    });

    it('should render contact information', () => {
        render(<Resume />);

        // Location - use getAllBy since it appears in multiple places
        expect(screen.getAllByText(/Ho Chi Minh City/i).length).toBeGreaterThan(0);

        // Email link
        const emailLink = screen.getByRole('link', { name: /Get in Touch/i });
        expect(emailLink).toBeInTheDocument();
    });

    it('should render download CV button', () => {
        render(<Resume />);
        const downloadButton = screen.getByRole('link', { name: /Download CV/i });
        expect(downloadButton).toBeInTheDocument();
    });
});
