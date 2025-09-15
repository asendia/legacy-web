import { describe, it, expect } from 'vitest';
import { isValidEmail } from './emailValidator';

describe('emailValidator', () => {
	describe('isValidEmail', () => {
		it('should return true for valid email addresses', () => {
			const validEmails = [
				'test@example.com',
				'user.name@example.com',
				'user+tag@example.com',
				'user123@example.co.uk',
				'test@sub.example.com',
				'firstname.lastname@domain.com',
				'1234567890@example.com',
				'email@example-one.com',
				'user@very-long-domain-name.com',
				'simple@example.com',
				'very.common@example.com',
				'disposable.style.email.with+symbol@example.com',
				'other.email-with-dash@example.com',
				'x@example.com',
				'example@s.example'
			];

			validEmails.forEach((email) => {
				expect(isValidEmail(email)).toBe(true);
			});
		});

		it('should return false for invalid email addresses', () => {
			const invalidEmails = [
				'',
				'invalid',
				'@example.com',
				'user@',
				'user@@example.com',
				'user@.com',
				'user@com',
				'.user@example.com',
				'user.@example.com',
				'user..name@example.com',
				'user@example.',
				'user@.example.com',
				'user@example..com',
				'user name@example.com', // space in local part
				'user@exam ple.com', // space in domain
				'user@',
				'@',
				'user@example',
				'user@example.c', // TLD too short
				'plainaddress',
				'user.example.com', // missing @
				'user@ex ample.com',
				'user@example .com'
			];

			invalidEmails.forEach((email) => {
				expect(isValidEmail(email)).toBe(false);
			});
		});

		it('should handle edge cases', () => {
			// Test with quoted strings (should be valid according to RFC)
			expect(isValidEmail('"test"@example.com')).toBe(true);
			expect(isValidEmail('"test test"@example.com')).toBe(true);

			// Test with special characters in local part
			expect(isValidEmail('test+123@example.com')).toBe(true);
			expect(isValidEmail('test_123@example.com')).toBe(true);
			expect(isValidEmail('test-123@example.com')).toBe(true);

			// Test with IP addresses
			expect(isValidEmail('user@[192.168.1.1]')).toBe(true);

			// Test very long but valid email
			const longLocalPart = 'a'.repeat(60);
			const longDomain = 'b'.repeat(50) + '.com';
			expect(isValidEmail(`${longLocalPart}@${longDomain}`)).toBe(true);
		});

		it('should handle runtime edge cases', () => {
			// Test case sensitivity and trimming behavior
			expect(isValidEmail('TEST@EXAMPLE.COM')).toBe(true);
			expect(isValidEmail('Test@Example.Com')).toBe(true);
		});

		it('should handle empty and whitespace strings', () => {
			expect(isValidEmail('')).toBe(false);
			expect(isValidEmail(' ')).toBe(false);
			expect(isValidEmail('\t')).toBe(false);
			expect(isValidEmail('\n')).toBe(false);
			expect(isValidEmail('  test@example.com  ')).toBe(false); // leading/trailing spaces
		});
	});
});
