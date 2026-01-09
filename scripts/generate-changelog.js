import { execSync } from 'node:child_process'
import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

try {
  console.log('Generating changelog...')

  // Get git log with a specific delimiter for easier parsing
  // Format: "DELIMITER|hash|author|date|message"
  const logData = execSync('git log -n 20 --pretty=format:"DELIMITER|%h|%an|%ad|%s"', { encoding: 'utf-8' })

  const commits = logData
    .split('DELIMITER|')
    .filter(Boolean) // Remove empty strings
    .map(header => {
      const [hash, author, date, message] = header.trim().split('|')

      return {
        hash,
        author,
        date,
        message
      }
    })

  const outputPath = join(process.cwd(), 'public', 'changelog.json')
  writeFileSync(outputPath, JSON.stringify(commits, null, 2))

  console.log(`Successfully generated changelog with ${commits.length} commits at ${outputPath}`)
} catch (error) {
  console.error('Failed to generate changelog:', error.message)
  // If git fails (e.g. no git repo in CI), write empty array to prevent build failure
  const outputPath = join(process.cwd(), 'public', 'changelog.json')
  if (!existsSync(join(process.cwd(), 'public'))) {
    mkdirSync(join(process.cwd(), 'public'))
  }
  writeFileSync(outputPath, JSON.stringify([]))
}
