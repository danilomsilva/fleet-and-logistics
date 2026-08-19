import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorState } from '@/shared/components/error-state/ErrorState'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/** Catches render/lifecycle errors anywhere below it so a bug in one screen
 * shows a recoverable fallback instead of a blank white page. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('Unhandled error in FleetOS:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-svh items-center justify-center p-6">
          <ErrorState
            title="Something went wrong"
            description="FleetOS hit an unexpected error. Reloading the page usually fixes it."
            onRetry={() => window.location.reload()}
            retryLabel="Reload"
          />
        </div>
      )
    }
    return this.props.children
  }
}
