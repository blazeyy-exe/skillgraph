import { describe, expect, it } from "vitest";
import {
  signUpSchema,
  loginSchema,
  forgotPasswordSchema,
  updatePasswordSchema,
} from "@/lib/validation/auth";

describe("Auth Validation Schemas", () => {
  describe("signUpSchema", () => {
    it("accepts valid sign up input", () => {
      const result = signUpSchema.safeParse({
        preferredName: "Sarah Jenkins",
        email: "sarah@example.com",
        password: "securepassword123",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.preferredName).toBe("Sarah Jenkins");
        expect(result.data.email).toBe("sarah@example.com");
      }
    });

    it("rejects short password (< 8 chars)", () => {
      const result = signUpSchema.safeParse({
        preferredName: "Sarah",
        email: "sarah@example.com",
        password: "short",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/8 characters/);
      }
    });

    it("rejects empty preferred name", () => {
      const result = signUpSchema.safeParse({
        preferredName: "   ",
        email: "sarah@example.com",
        password: "securepassword123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid email formats", () => {
      const result = signUpSchema.safeParse({
        preferredName: "Sarah",
        email: "invalid-email",
        password: "securepassword123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("accepts valid email and password", () => {
      const result = loginSchema.safeParse({
        email: "user@skillgraph.internal",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty credentials", () => {
      const result = loginSchema.safeParse({
        email: "",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("forgotPasswordSchema", () => {
    it("validates email", () => {
      expect(forgotPasswordSchema.safeParse({ email: "test@example.com" }).success).toBe(true);
      expect(forgotPasswordSchema.safeParse({ email: "invalid" }).success).toBe(false);
    });
  });

  describe("updatePasswordSchema", () => {
    it("requires matching passwords", () => {
      const matching = updatePasswordSchema.safeParse({
        password: "new-password-123",
        confirmPassword: "new-password-123",
      });
      expect(matching.success).toBe(true);

      const mismatched = updatePasswordSchema.safeParse({
        password: "new-password-123",
        confirmPassword: "different-password",
      });
      expect(mismatched.success).toBe(false);
      if (!mismatched.success) {
        expect(mismatched.error.issues[0]?.message).toMatch(/match/);
      }
    });
  });
});
