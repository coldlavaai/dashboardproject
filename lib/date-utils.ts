/**
 * Parse various date formats and convert to YYYY-MM-DD for database storage
 */
export function parseFlexibleDate(dateStr: string): string | null {
  if (!dateStr || !dateStr.trim()) {
    return null
  }

  const cleaned = dateStr.trim()

  // Try various date patterns
  const patterns = [
    // ISO format: 2024-07-31
    {
      regex: /^(\d{4})-(\d{2})-(\d{2})$/,
      format: (matches: RegExpMatchArray) => `${matches[1]}-${matches[2]}-${matches[3]}`,
    },
    // UK format: 31/07/2024 or 31-07-2024
    {
      regex: /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
      format: (matches: RegExpMatchArray) => {
        const day = matches[1].padStart(2, '0')
        const month = matches[2].padStart(2, '0')
        return `${matches[3]}-${month}-${day}`
      },
    },
    // Short year: 31/07/24
    {
      regex: /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/,
      format: (matches: RegExpMatchArray) => {
        const day = matches[1].padStart(2, '0')
        const month = matches[2].padStart(2, '0')
        const year = parseInt(matches[3]) >= 50 ? `19${matches[3]}` : `20${matches[3]}`
        return `${year}-${month}-${day}`
      },
    },
    // Month name: 31 Jul, 31 Jul 2024, Jul 31 2024
    {
      regex: /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*(\d{4})?$/i,
      format: (matches: RegExpMatchArray) => {
        const day = matches[1].padStart(2, '0')
        const monthMap: Record<string, string> = {
          jan: '01', feb: '02', mar: '03', apr: '04',
          may: '05', jun: '06', jul: '07', aug: '08',
          sep: '09', oct: '10', nov: '11', dec: '12',
        }
        const month = monthMap[matches[2].toLowerCase().substring(0, 3)]
        let year = matches[3] ? parseInt(matches[3]) : new Date().getFullYear()

        // If no year provided, check if date would be in the future
        if (!matches[3]) {
          const testDate = new Date(`${year}-${month}-${day}`)
          const now = new Date()
          // If date is more than 30 days in the future, assume it's from last year
          if (testDate.getTime() - now.getTime() > 30 * 24 * 60 * 60 * 1000) {
            year -= 1
          }
        }

        return `${year}-${month}-${day}`
      },
    },
    // US format with month name: Jul 31 2024
    {
      regex: /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})\s*(\d{4})?$/i,
      format: (matches: RegExpMatchArray) => {
        const day = matches[2].padStart(2, '0')
        const monthMap: Record<string, string> = {
          jan: '01', feb: '02', mar: '03', apr: '04',
          may: '05', jun: '06', jul: '07', aug: '08',
          sep: '09', oct: '10', nov: '11', dec: '12',
        }
        const month = monthMap[matches[1].toLowerCase().substring(0, 3)]
        let year = matches[3] ? parseInt(matches[3]) : new Date().getFullYear()

        // If no year provided, check if date would be in the future
        if (!matches[3]) {
          const testDate = new Date(`${year}-${month}-${day}`)
          const now = new Date()
          // If date is more than 30 days in the future, assume it's from last year
          if (testDate.getTime() - now.getTime() > 30 * 24 * 60 * 60 * 1000) {
            year -= 1
          }
        }

        return `${year}-${month}-${day}`
      },
    },
  ]

  // Try each pattern
  for (const pattern of patterns) {
    const matches = cleaned.match(pattern.regex)
    if (matches) {
      try {
        const formatted = pattern.format(matches)
        // Validate the date is real
        const date = new Date(formatted)
        if (!isNaN(date.getTime())) {
          return formatted
        }
      } catch (err) {
        continue
      }
    }
  }

  // If no pattern matched, return null
  return null
}

/**
 * Detect the date format from a sample string
 */
export function detectDateFormat(dateStr: string): string {
  if (!dateStr || !dateStr.trim()) {
    return 'Unknown'
  }

  const cleaned = dateStr.trim()

  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return 'YYYY-MM-DD (ISO)'
  }
  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(cleaned)) {
    return 'DD/MM/YYYY (UK)'
  }
  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2}$/.test(cleaned)) {
    return 'DD/MM/YY'
  }
  if (/^\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(cleaned)) {
    return 'DD Mon YYYY'
  }
  if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}/i.test(cleaned)) {
    return 'Mon DD YYYY'
  }

  return 'Custom format'
}
