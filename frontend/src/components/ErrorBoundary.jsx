import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center p-8 bg-[#1a1a2e] border border-red-500/30 rounded-2xl max-w-md">
            <div className="text-5xl mb-4">💥</div>
            <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong</h2>
            <p className="text-slate-400 text-sm mb-6">{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
