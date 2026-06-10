"use client";

import { useState } from "react";
import { z } from "zod";

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long")
    .regex(/^[\d\+\-\s\(\)]+$/, "Phone number can only contain digits, spaces, +, -, and parentheses"),
});

export type CustomerData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  onSubmit: (data: CustomerData) => void;
  isLoading?: boolean;
}

export function CustomerForm({ onSubmit, isLoading = false }: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerData>({
    name: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CustomerData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CustomerData, boolean>>>({});

  const validateField = (field: keyof CustomerData, value: string): string | undefined => {
    const result = customerSchema.shape[field].safeParse(value);
    if (!result.success) {
      return result.error.issues[0].message;
    }
    return undefined;
  };

  const handleChange = (field: keyof CustomerData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: keyof CustomerData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const result = customerSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CustomerData, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof CustomerData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      setTouched({ name: true, email: true, phone: true });
      return;
    }

    onSubmit(formData);
  };

  const isFormValid = customerSchema.safeParse(formData).success;

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          onBlur={() => handleBlur("name")}
          placeholder="John Doe"
          className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            errors.name && touched.name
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
          disabled={isLoading}
        />
        {errors.name && touched.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
          placeholder="john@example.com"
          className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            errors.email && touched.email
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
          disabled={isLoading}
        />
        {errors.email && touched.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          onBlur={() => handleBlur("phone")}
          placeholder="+234 123 456 7890"
          className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            errors.phone && touched.phone
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
          disabled={isLoading}
        />
        {errors.phone && touched.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !isFormValid}
        className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Processing..." : "Continue to Payment"}
      </button>
    </form>
  );
}
