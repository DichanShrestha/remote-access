import { addSection, removeSection, moveSection, updateSection } from './operations';
import { PageDocument, PageSection } from './schemas';

// Note: Ensure your testing framework (Vitest/Jest) is configured to run this.

describe('Page Engine Operations', () => {
  let doc: PageDocument;

  beforeEach(() => {
    doc = {
      version: 1,
      theme: { style: 'premium-minimal', primaryColor: '#000000', radius: 'medium', density: 'comfortable' },
      settings: { showFooterBranding: true },
      sections: [
        { id: 'sec-1', type: 'hero', isHidden: false, content: { title: 'Hello' }, layout: 'center' }
      ]
    };
  });

  it('adds a section at the end', () => {
    const newSec: PageSection = { id: 'sec-2', type: 'rich-text', isHidden: false, content: { text: 'New Text' } };
    const result = addSection(doc, newSec);
    expect(result.sections).toHaveLength(2);
    expect(result.sections[1].id).toBe('sec-2');
  });

  it('removes a section', () => {
    const result = removeSection(doc, 'sec-1');
    expect(result.sections).toHaveLength(0);
  });

  it('moves a section', () => {
    const docWithTwo = addSection(doc, { id: 'sec-2', type: 'rich-text', isHidden: false, content: { text: 'New Text' } });
    const result = moveSection(docWithTwo, 0, 1);
    expect(result.sections[0].id).toBe('sec-2');
    expect(result.sections[1].id).toBe('sec-1');
  });

  it('updates a section', () => {
    const result = updateSection(doc, 'sec-1', { isHidden: true });
    expect(result.sections[0].isHidden).toBe(true);
  });
});
