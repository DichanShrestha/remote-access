import { addSection, removeSection, moveSection, updateSection, insertNode, isGroup, moveNode, findNode } from './operations';
import { GroupNode, PageDocument, PageDocumentSchema, PageSection } from './schemas';
import { TEMPLATES_MAP } from './templates';

// Note: Ensure your testing framework (Vitest/Jest) is configured to run this.

describe('Page Engine Operations', () => {
  let doc: PageDocument;

  beforeEach(() => {
    doc = {
      version: 1,
      theme: { style: 'premium-minimal', primaryColor: '#000000', radius: 'medium', density: 'comfortable' },
      settings: { showFooterBranding: true, enableSmoothScrolling: false },
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
    expect(isGroup(result.sections[0])).toBe(false);
    if (!isGroup(result.sections[0])) expect(result.sections[0].isHidden).toBe(true);
  });

  it('moves components into and out of nested layout groups', () => {
    const group: GroupNode = {
      kind: 'group', id: 'group-1', name: 'Content', direction: 'column', horizontalAlign: 'left', verticalAlign: 'top',
      width: 'full', customWidth: 100, gap: 'medium', customGap: 24, padding: 'medium', customPadding: 24,
      mobileDirection: 'column', children: [],
    };
    const withGroup = insertNode(doc, group);
    const movedIn = moveNode(withGroup, 'sec-1', 'group-1', 0);
    expect(isGroup(movedIn.sections[0])).toBe(true);
    expect(findNode(movedIn.sections, 'sec-1')).toBeDefined();
    const withSecondChild = insertNode(movedIn, { id: 'sec-2', type: 'rich-text', isHidden: false, content: { text: 'More' } }, 'group-1');
    const groupWithMultipleChildren = findNode(withSecondChild.sections, 'group-1');
    expect(isGroup(groupWithMultipleChildren!)).toBe(true);
    if (groupWithMultipleChildren && isGroup(groupWithMultipleChildren)) expect(groupWithMultipleChildren.children).toHaveLength(2);
    const movedOut = moveNode(withSecondChild, 'sec-1', undefined, 1);
    expect(movedOut.sections.map(node => node.id)).toEqual(['group-1', 'sec-1']);
  });

  it('rejects group nesting deeper than four levels', () => {
    const makeGroup = (id: string, children: GroupNode[] = []): GroupNode => ({
      kind: 'group', id, name: id, direction: 'column', horizontalAlign: 'left', verticalAlign: 'top', width: 'full', customWidth: 100,
      gap: 'medium', customGap: 24, padding: 'medium', customPadding: 24, mobileDirection: 'column', children,
    });
    const nested = makeGroup('g1', [makeGroup('g2', [makeGroup('g3', [makeGroup('g4')])])]);
    const docAtLimit = insertNode({ ...doc, sections: [nested] }, {
      ...makeGroup('g5'),
    }, 'g4');
    expect(findNode(docAtLimit.sections, 'g5')).toBeUndefined();
  });

  it('preserves existing templates and parses grouped content and colors', () => {
    Object.values(TEMPLATES_MAP).forEach(template => {
      expect(PageDocumentSchema.safeParse(template).success).toBe(true);
    });
    const parsed = PageDocumentSchema.safeParse({
      sections: [{
        kind: 'group', id: 'group-color', backgroundColor: '#112233', textColor: '#ffffff',
        children: [{ id: 'group-child', type: 'rich-text', isHidden: false, content: { text: 'Content' } }],
      }],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success && isGroup(parsed.data.sections[0])) {
      expect(parsed.data.sections[0].backgroundColor).toBe('#112233');
      expect(parsed.data.sections[0].children).toHaveLength(1);
    }
  });
});
