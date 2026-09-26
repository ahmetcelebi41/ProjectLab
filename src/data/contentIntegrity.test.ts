import { contentCollections } from '@/data';

import { assertContentIntegrity, validateContentIntegrity } from './contentIntegrity';

describe('content integrity', () => {
  it('Project, Lesson ve Quiz iliskilerini gecerli tutar', () => {
    expect(validateContentIntegrity(contentCollections)).toEqual([]);
    expect(() => assertContentIntegrity(contentCollections)).not.toThrow();
  });
});
