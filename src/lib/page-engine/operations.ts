import { PageDocument, PageSection } from './schemas';

/**
 * Adds a new section to the document.
 * If index is provided, inserts at that position. Otherwise appends.
 */
export function addSection(doc: PageDocument, section: PageSection, index?: number): PageDocument {
  const newSections = [...doc.sections];
  if (typeof index === 'number' && index >= 0 && index <= newSections.length) {
    newSections.splice(index, 0, section);
  } else {
    newSections.push(section);
  }
  return { ...doc, sections: newSections };
}

/**
 * Removes a section by id.
 */
export function removeSection(doc: PageDocument, sectionId: string): PageDocument {
  return {
    ...doc,
    sections: doc.sections.filter(s => s.id !== sectionId)
  };
}

/**
 * Moves a section from one index to another.
 */
export function moveSection(doc: PageDocument, fromIndex: number, toIndex: number): PageDocument {
  if (
    fromIndex < 0 || fromIndex >= doc.sections.length ||
    toIndex < 0 || toIndex >= doc.sections.length
  ) {
    return doc; // Out of bounds, do nothing
  }

  const newSections = [...doc.sections];
  const [movedSection] = newSections.splice(fromIndex, 1);
  newSections.splice(toIndex, 0, movedSection);

  return { ...doc, sections: newSections };
}

/**
 * Updates a specific section's properties.
 */
export function updateSection(doc: PageDocument, sectionId: string, updates: Partial<PageSection>): PageDocument {
  return {
    ...doc,
    sections: doc.sections.map(s => {
      if (s.id === sectionId) {
        // Simple merge, relies on caller providing valid partial section data
        return { ...s, ...updates } as PageSection;
      }
      return s;
    })
  };
}

export function duplicateSection(doc: PageDocument, id: string): PageDocument {
  const index = doc.sections.findIndex(s => s.id === id);
  if (index === -1) return doc;
  
  const original = doc.sections[index];
  // Deep copy the original to avoid referencing nested objects, just in case
  const duplicated = JSON.parse(JSON.stringify(original));
  duplicated.id = Math.random().toString(36).substr(2, 9);
  
  const newSections = [...doc.sections];
  newSections.splice(index + 1, 0, duplicated);
  return { ...doc, sections: newSections };
}

export function toggleSectionVisibility(doc: PageDocument, id: string): PageDocument {
  return {
    ...doc,
    sections: doc.sections.map(s => s.id === id ? { ...s, isHidden: !s.isHidden } : s)
  };
}
