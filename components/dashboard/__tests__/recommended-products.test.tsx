import React from "react"
import '@testing-library/jest-dom'
import { render, screen } from "@testing-library/react"
import RecommendedProducts from "@/components/dashboard/recommended-products"

describe("RecommendedProducts", () => {
  it("renders sample products", () => {
    render(<RecommendedProducts />)
    expect(screen.getByText(/Wireless Headphones/i)).toBeInTheDocument()
    expect(screen.getByText(/Reusable Water Bottle/i)).toBeInTheDocument()
  })
})
