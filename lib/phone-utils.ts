/**
 * Normalize UK phone numbers to E.164 format (+447XXXXXXXXX)
 */
export function normalizeUKPhone(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '')

  // Handle different UK formats
  if (cleaned.startsWith('447')) {
    // Already in international format without +
    return `+${cleaned}`
  } else if (cleaned.startsWith('44')) {
    // Has country code but missing leading 7
    return `+${cleaned}`
  } else if (cleaned.startsWith('07')) {
    // UK mobile starting with 07
    return `+44${cleaned.substring(1)}`
  } else if (cleaned.startsWith('7') && cleaned.length === 10) {
    // Missing the 0
    return `+44${cleaned}`
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    // Standard UK format with leading 0
    return `+44${cleaned.substring(1)}`
  }

  // If we can't normalize it, return with + if not already
  return phone.startsWith('+') ? phone : `+${cleaned}`
}

/**
 * Validate that a phone number looks valid
 */
export function isValidUKPhone(phone: string): boolean {
  const normalized = normalizeUKPhone(phone)

  // UK mobile numbers should be +447XXXXXXXXX (13 chars total)
  // UK landlines could be +441XXXXXXXXX or +442XXXXXXXXX etc.
  if (!normalized.startsWith('+44')) return false
  if (normalized.length < 12 || normalized.length > 13) return false

  return true
}
