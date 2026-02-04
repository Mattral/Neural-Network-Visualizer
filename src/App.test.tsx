import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the app', () => {
    render(<App />)
    // Since it's a router app, check for something in Index or just that it doesn't crash
    expect(document.body).toBeInTheDocument()
  })
})