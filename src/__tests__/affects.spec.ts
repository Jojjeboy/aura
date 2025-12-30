import { describe, it, expect } from 'vitest'
import { AFFECTS } from '../constants/affects'
import en from '../locales/en.json'
import sv from '../locales/sv.json'


type LocaleData = {
  affects: Record<string, {
    name: string;
    description: string;
    related: Record<string, string>;
  }>;
};

describe('Affect Theory Data & Localization', () => {
  it('should have exactly 9 basic affects', () => {
    expect(AFFECTS.length).toBe(9)
  })

  it('should have correct structure for each affect', () => {
    AFFECTS.forEach(affect => {
      expect(affect).toHaveProperty('id')
      expect(affect).toHaveProperty('related')
      expect(Array.isArray(affect.related)).toBe(true)
      expect(affect.related.length).toBeGreaterThan(0)
    })
  })

  describe('Localization (EN)', () => {
    const affects = (en as unknown as LocaleData).affects

    it('should have translations for all basic affects', () => {
      AFFECTS.forEach(affect => {
        expect(affects).toHaveProperty(affect.id)
        expect(affects[affect.id]).toHaveProperty('name')
        expect(affects[affect.id]).toHaveProperty('description')
      })
    })

    it('should have translations for all related emotions', () => {
      AFFECTS.forEach(affect => {
        const affectLoc = affects[affect.id]!
        expect(affectLoc).toHaveProperty('related')

        affect.related.forEach(emotionId => {
          expect(affectLoc.related).toHaveProperty(emotionId)
          expect(typeof affectLoc.related[emotionId]).toBe('string')
        })
      })
    })
  })

  describe('Localization (SV)', () => {
    const affects = (sv as unknown as LocaleData).affects

    it('should have translations for all basic affects', () => {
      AFFECTS.forEach(affect => {
        expect(affects).toHaveProperty(affect.id)
        expect(affects[affect.id]).toHaveProperty('name')
        expect(affects[affect.id]).toHaveProperty('description')
      })
    })

    it('should have translations for all related emotions', () => {
      AFFECTS.forEach(affect => {
        const affectLoc = affects[affect.id]!
        expect(affectLoc).toHaveProperty('related')

        affect.related.forEach(emotionId => {
          expect(affectLoc.related).toHaveProperty(emotionId)
          expect(typeof affectLoc.related[emotionId]).toBe('string')
        })
      })
    })
  })
})
