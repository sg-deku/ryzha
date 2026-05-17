"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CompanyStep } from "./steps/company"
import { TaxSettingsStep } from "./steps/tax-settings"

export function OnboardingWizard() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    legalName: "",
    address: {
      street: "",
      city: "",
      country: "",
      postalCode: ""
    },
    taxId: "",
    defaultTaxRate: 0,
    currency: "USD",
    taxRules: []
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const updateData = (newData: any) => {
    setFormData((prev) => ({ ...prev, ...newData }))
  }

  const handleNext = () => setStep(step + 1)
  const handleBack = () => setStep(step - 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        router.push("/dashboard")
        router.refresh()
      } else {
        alert("Failed to complete onboarding")
      }
    } catch (error) {
      console.error(error)
      alert("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white border rounded-lg shadow-sm">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`w-1/2 h-2 rounded-full mx-1 ${
                step >= i ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <p className="text-center mt-2 text-sm text-gray-500">
          Step {step} of 2
        </p>
      </div>

      <form onSubmit={step === 2 ? handleSubmit : (e) => e.preventDefault()}>
        {step === 1 && (
          <CompanyStep data={formData} updateData={updateData} />
        )}
        {step === 2 && (
          <TaxSettingsStep data={formData} updateData={updateData} />
        )}

        <div className="mt-8 flex justify-between">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2 border rounded hover:bg-gray-50"
            >
              Back
            </button>
          )}
          <div className="flex-1" />
          {step < 2 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Completing..." : "Complete Setup"}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
