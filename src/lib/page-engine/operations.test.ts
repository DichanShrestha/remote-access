import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { addSection, removeSection, moveSection, updateSection, insertNode, isGroup, moveNode, findNode } from './operations';
import { GroupNode, PageDocument, PageDocumentSchema, PageSection } from './schemas';
import { TEMPLATES_MAP } from './templates';

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
    assert.equal(result.sections.length, 2);
    assert.equal(result.sections[1].id, 'sec-2');
  });

  it('removes a section', () => {
    const result = removeSection(doc, 'sec-1');
    assert.equal(result.sections.length, 0);
  });

  it('moves a section', () => {
    const docWithTwo = addSection(doc, { id: 'sec-2', type: 'rich-text', isHidden: false, content: { text: 'New Text' } });
    const result = moveSection(docWithTwo, 0, 1);
    assert.equal(result.sections[0].id, 'sec-2');
    assert.equal(result.sections[1].id, 'sec-1');
  });

  it('updates a section', () => {
    const result = updateSection(doc, 'sec-1', { isHidden: true });
    assert.equal(isGroup(result.sections[0]), false);
    if (!isGroup(result.sections[0])) assert.equal(result.sections[0].isHidden, true);
  });

  it('moves components into and out of nested layout groups', () => {
    const group: GroupNode = {
      kind: 'group', id: 'group-1', name: 'Content', direction: 'column', horizontalAlign: 'left', verticalAlign: 'top',
      width: 'full', customWidth: 100, gap: 'medium', customGap: 24, padding: 'medium', customPadding: 24,
      mobileDirection: 'column', children: [],
    };
    const withGroup = insertNode(doc, group);
    const movedIn = moveNode(withGroup, 'sec-1', 'group-1', 0);
    assert.equal(isGroup(movedIn.sections[0]), true);
    assert.notEqual(findNode(movedIn.sections, 'sec-1'), undefined);
    const withSecondChild = insertNode(movedIn, { id: 'sec-2', type: 'rich-text', isHidden: false, content: { text: 'More' } }, 'group-1');
    const groupWithMultipleChildren = findNode(withSecondChild.sections, 'group-1');
    assert.ok(groupWithMultipleChildren && isGroup(groupWithMultipleChildren));
    if (groupWithMultipleChildren && isGroup(groupWithMultipleChildren)) {
      assert.equal(groupWithMultipleChildren.children.length, 2);
    }
    const movedOut = moveNode(withSecondChild, 'sec-1', undefined, 1);
    assert.deepEqual(movedOut.sections.map(node => node.id), ['group-1', 'sec-1']);
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
    assert.equal(findNode(docAtLimit.sections, 'g5'), undefined);
  });

  it('preserves existing templates and parses grouped content and colors', () => {
    Object.values(TEMPLATES_MAP).forEach(template => {
      assert.equal(PageDocumentSchema.safeParse(template).success, true);
    });
    const parsed = PageDocumentSchema.safeParse({
      sections: [{
        kind: 'group', id: 'group-color', backgroundColor: '#112233', textColor: '#ffffff',
        children: [{ id: 'group-child', type: 'rich-text', isHidden: false, content: { text: 'Content' } }],
      }],
    });
    assert.equal(parsed.success, true);
    if (parsed.success && isGroup(parsed.data.sections[0])) {
      assert.equal(parsed.data.sections[0].backgroundColor, '#112233');
      assert.equal(parsed.data.sections[0].children.length, 1);
    }
  });
});
