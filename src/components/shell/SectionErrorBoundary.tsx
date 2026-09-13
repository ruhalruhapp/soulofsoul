"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  sectionName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Section error boundary — graceful degradation when a single section fails.
 *
 * Per §17.3: classifier/generation failure → fallback to bridging behavior,
 * never substantive replies. This boundary applies the same principle to
 * the UI: a section failure should never crash the whole app or hide the
 * crisis bar / crisis overlay (which are outside this boundary).
 */
export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // Reset error state when the section changes — a crash in Home should not
  // prevent the user from navigating to Wellness, Companion, etc.
  componentDidUpdate(prevProps: Props) {
    if (prevProps.sectionName !== this.props.sectionName && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[SectionErrorBoundary] ${this.props.sectionName ?? "section"} crashed:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleHome = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const sectionName = this.props.sectionName ?? "This section";
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center max-w-md mx-auto space-y-4">
          <div className="size-14 rounded-full bg-amber-500/15 flex items-center justify-center">
            <AlertTriangle className="size-7 text-amber-600" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold">{sectionName} hit an error</h2>
            <p className="text-sm text-muted-foreground">
              This is a reference implementation — the error has been logged to the console.
              The rest of the platform is unaffected, and crisis resources remain reachable
              from the bar at the top of every screen.
            </p>
          </div>

          {this.state.error && (
            <details className="w-full text-left rounded-lg border bg-muted/30 p-3">
              <summary className="text-xs font-medium cursor-pointer">
                Error details
              </summary>
              <pre className="text-[10px] mt-2 font-mono whitespace-pre-wrap break-all text-muted-foreground">
                {this.state.error.message}
                {this.state.error.stack && `\n\n${this.state.error.stack}`}
              </pre>
            </details>
          )}

          <div className="flex gap-2">
            <Button onClick={this.handleRetry} variant="outline" size="sm">
              <RefreshCw className="size-3.5" />
              Retry
            </Button>
            <Button onClick={this.handleHome} size="sm">
              <Home className="size-3.5" />
              Reload app
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground pt-2 border-t w-full">
            If you are in crisis, call 988 (US) or your local emergency number. The crisis
            bar at the top of this page is always available, regardless of section errors.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
