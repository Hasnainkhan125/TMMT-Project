import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckFormSheet } from '../CheckFormSheet';
import type { Service } from '@/lib/services';

// ---------------------------------------------------------------------------
// Auth context mock
// ---------------------------------------------------------------------------
const mockAuthContext = {
  user: null as { name: string; email: string } | null,
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// ---------------------------------------------------------------------------
// Minimal service fixtures
// ---------------------------------------------------------------------------
const freeService: Service = {
  id: 'overstay-fine',
  title: 'Overstay Fine Checker',
  shortTitle: 'Overstay Fine',
  description: 'Check overstay penalties',
  longDescription: '',
  authority: 'ICP + GDRFA',
  image: '/images/overstay-fine.jpg',
  icon: 'calendar-clock',
  priceStandard: 20,
  priceFastTrack: 50,
  turnaroundStandard: '24-48 hours',
  turnaroundFastTrack: '24 hours',
  fields: [
    {
      id: 'passportNumber',
      label: 'Passport Number',
      type: 'passport',
      placeholder: 'Enter passport number',
      required: true,
    },
  ],
  documents: [
    {
      id: 'passportBio',
      label: 'Passport Bio Page',
      required: true,
      accept: ['image/jpeg', 'application/pdf'],
      maxSize: 10,
    },
  ],
  resultFields: [],
};

const paidService: Service = {
  ...freeService,
  id: 'travel-ban',
  title: 'Travel Ban Check',
  shortTitle: 'Travel Ban',
  description: 'Check for travel ban',
};

// ---------------------------------------------------------------------------
// Fetch mock helpers
// ---------------------------------------------------------------------------
function mockFetchSuccess() {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ status: 'success', data: { check: { _id: 'chk_123', status: 'submitted' } } }),
  } as Response));
}

function mockFetchFailure() {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: false,
    json: async () => ({ message: 'Server error' }),
  } as Response));
}

// ---------------------------------------------------------------------------
// Render helper
// ---------------------------------------------------------------------------
function renderSheet(service: Service, isOpen = true, onClose = vi.fn()) {
  return render(
    <CheckFormSheet service={service} isOpen={isOpen} onClose={onClose} />
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('CheckFormSheet', () => {
  beforeEach(() => {
    mockAuthContext.user = null;
    vi.clearAllMocks();
    mockFetchSuccess();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- Rendering ---
  describe('initial rendering', () => {
    it('renders the sheet when isOpen is true', () => {
      renderSheet(freeService);
      expect(screen.getByText('Overstay Fine Checker')).toBeInTheDocument();
    });

    it('does not render visible content when isOpen is false', () => {
      renderSheet(freeService, false);
      expect(screen.queryByText('Overstay Fine Checker')).not.toBeInTheDocument();
    });

    it('shows step 1 (Info) by default', () => {
      renderSheet(freeService);
      // Step 1 title key rendered by i18n mock as the key itself
      expect(screen.getByText('checks.step1.title')).toBeInTheDocument();
    });

    it('renders the service image', () => {
      renderSheet(freeService);
      const img = screen.getByAltText('Overstay Fine Checker');
      expect(img).toBeInTheDocument();
    });
  });

  // --- Step navigation ---
  describe('step navigation', () => {
    it('advances to step 2 when Next is clicked', async () => {
      renderSheet(freeService);
      const nextButton = screen.getByRole('button', { name: /next|continue/i });
      await userEvent.click(nextButton);
      await waitFor(() => {
        expect(screen.getByText('checks.step2.title')).toBeInTheDocument();
      });
    });

    it('goes back to step 1 from step 2', async () => {
      renderSheet(freeService);
      // Go forward
      await userEvent.click(screen.getByRole('button', { name: /next|continue/i }));
      await waitFor(() => screen.getByText('checks.step2.title'));
      // Go back
      const backButton = screen.getByRole('button', { name: /back/i });
      await userEvent.click(backButton);
      await waitFor(() => {
        expect(screen.getByText('checks.step1.title')).toBeInTheDocument();
      });
    });

    it('can navigate all four steps', async () => {
      renderSheet(freeService);
      const stepTitles = [
        'checks.step1.title',
        'checks.step2.title',
        'checks.step3.title',
        'checks.step4.title',
      ];

      expect(screen.getByText(stepTitles[0])).toBeInTheDocument();

      for (let i = 1; i < stepTitles.length; i++) {
        const nextBtn = screen.getByRole('button', { name: /next|continue/i });
        await userEvent.click(nextBtn);
        await waitFor(() => {
          expect(screen.getByText(stepTitles[i])).toBeInTheDocument();
        });
      }
    });
  });

  // --- Free service behaviour ---
  describe('free service (overstay-fine)', () => {
    it('shows free service card on step 3 instead of price options', async () => {
      renderSheet(freeService);
      // Skip to step 3
      for (let i = 0; i < 2; i++) {
        await userEvent.click(screen.getByRole('button', { name: /next|continue/i }));
      }
      await waitFor(() => screen.getByText('checks.step3.title'));
      // Free service uses the key checks.step3.freeService (appears in badge + heading)
      const freeElements = screen.getAllByText('checks.step3.freeService');
      expect(freeElements.length).toBeGreaterThan(0);
      // Paid speed options should NOT appear
      expect(screen.queryByText('checks.step3.standard')).not.toBeInTheDocument();
    });
  });

  // --- Paid service behaviour ---
  describe('paid service (travel-ban)', () => {
    it('shows pricing options on step 3', async () => {
      renderSheet(paidService);
      // Skip to step 3
      for (let i = 0; i < 2; i++) {
        await userEvent.click(screen.getByRole('button', { name: /next|continue/i }));
      }
      await waitFor(() => screen.getByText('checks.step3.title'));
      // Standard and fast-track labels (exact i18n keys)
      expect(screen.getByText('checks.step3.standard')).toBeInTheDocument();
      expect(screen.getByText('checks.step3.fastTrack')).toBeInTheDocument();
    });
  });

  // --- Login gate ---
  describe('login gate on step 4', () => {
    it('shows login prompt when user is not authenticated on step 4', async () => {
      mockAuthContext.user = null;
      renderSheet(freeService);
      // Navigate to step 4
      for (let i = 0; i < 3; i++) {
        await userEvent.click(screen.getByRole('button', { name: /next|continue/i }));
      }
      await waitFor(() => screen.getByText('checks.step4.title'));
      expect(screen.getByText('checks.loginRequired')).toBeInTheDocument();
    });

    it('does not show login prompt when user is authenticated', async () => {
      mockAuthContext.user = { name: 'Ahmed', email: 'ahmed@example.com' };
      renderSheet(freeService);
      for (let i = 0; i < 3; i++) {
        await userEvent.click(screen.getByRole('button', { name: /next|continue/i }));
      }
      await waitFor(() => screen.getByText('checks.step4.title'));
      expect(screen.queryByText('checks.loginRequired')).not.toBeInTheDocument();
    });

    it('shows Sign In and Create Account buttons when unauthenticated on step 4', async () => {
      mockAuthContext.user = null;
      renderSheet(freeService);
      for (let i = 0; i < 3; i++) {
        await userEvent.click(screen.getByRole('button', { name: /next|continue/i }));
      }
      await waitFor(() => screen.getByText('checks.loginRequired'));
      expect(screen.getByText('checks.signIn')).toBeInTheDocument();
      expect(screen.getByText('checks.createAccount')).toBeInTheDocument();
    });
  });

  // --- Form submission ---
  describe('form submission', () => {
    beforeEach(() => {
      mockAuthContext.user = { name: 'Ahmed', email: 'ahmed@example.com' };
    });

    it('calls fetch with correct endpoint on submit', async () => {
      renderSheet(freeService);
      // Navigate to step 4
      for (let i = 0; i < 3; i++) {
        await userEvent.click(screen.getByRole('button', { name: /next|continue/i }));
      }
      await waitFor(() => screen.getByText('checks.step4.title'));
      const submitButton = screen.getByRole('button', { name: /submit|confirm/i });
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/checks'),
          expect.objectContaining({ method: 'POST' })
        );
      });
    });

    it('shows success state after successful submission', async () => {
      mockFetchSuccess();
      renderSheet(freeService);
      for (let i = 0; i < 3; i++) {
        await userEvent.click(screen.getByRole('button', { name: /next|continue/i }));
      }
      await waitFor(() => screen.getByText('checks.step4.title'));
      const submitButton = screen.getByRole('button', { name: /submit|confirm/i });
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('checks.successTitle')).toBeInTheDocument();
      });
    });

    it('shows error toast when submission fails', async () => {
      mockFetchFailure();
      const { toast } = await import('sonner');
      renderSheet(freeService);
      for (let i = 0; i < 3; i++) {
        await userEvent.click(screen.getByRole('button', { name: /next|continue/i }));
      }
      await waitFor(() => screen.getByText('checks.step4.title'));
      const submitButton = screen.getByRole('button', { name: /submit|confirm/i });
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('checks.errorSubmit');
      });
    });
  });

  // --- File handling ---
  describe('document upload (step 2)', () => {
    it('renders document upload zones on step 2', async () => {
      renderSheet(freeService);
      await userEvent.click(screen.getByRole('button', { name: /next|continue/i }));
      await waitFor(() => screen.getByText('checks.step2.title'));
      expect(screen.getByText('Passport Bio Page')).toBeInTheDocument();
    });

    it('adds a file when selected via input', async () => {
      renderSheet(freeService);
      await userEvent.click(screen.getByRole('button', { name: /next|continue/i }));
      await waitFor(() => screen.getByText('checks.step2.title'));

      const file = new File(['dummy content'], 'passport.pdf', { type: 'application/pdf' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) {
        await act(async () => {
          fireEvent.change(input, { target: { files: [file] } });
        });
        await waitFor(() => {
          expect(screen.getByText('passport.pdf')).toBeInTheDocument();
        });
      }
    });

    it('rejects files over 10MB', async () => {
      const { toast } = await import('sonner');
      renderSheet(freeService);
      await userEvent.click(screen.getByRole('button', { name: /next|continue/i }));
      await waitFor(() => screen.getByText('checks.step2.title'));

      const bigFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'big.pdf', { type: 'application/pdf' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) {
        await act(async () => {
          fireEvent.change(input, { target: { files: [bigFile] } });
        });
        await waitFor(() => {
          expect(toast.error).toHaveBeenCalled();
        });
      }
    });
  });

  // --- Close / reset ---
  describe('close behaviour', () => {
    it('calls onClose when the close button is clicked', async () => {
      const onClose = vi.fn();
      renderSheet(freeService, true, onClose);
      const closeButton = screen.getByRole('button', { name: /close/i });
      await userEvent.click(closeButton);
      expect(onClose).toHaveBeenCalled();
    });
  });
});
