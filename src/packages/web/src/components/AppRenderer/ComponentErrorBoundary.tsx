import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  componentId: string;
  componentType: string;
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {
    // Error is already captured in getDerivedStateFromError and displayed in render
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          data-component-error={this.props.componentId}
          className="rounded-lg bg-utility-red-50 p-4 text-sm text-utility-red-700 ring-1 ring-utility-red-200 ring-inset"
        >
          <p className="font-medium">
            Erreur dans le composant {this.props.componentType}
          </p>
          <p className="mt-1 text-xs text-utility-red-500">
            {this.state.error?.message ?? 'Erreur inconnue'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
