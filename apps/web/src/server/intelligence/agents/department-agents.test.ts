import { describe, expect, it } from 'vitest';

import { DEPARTMENT_PROMPTS, listDepartmentAgents } from './department-profiles';

describe('department agents', () => {
  it('lists all departments with Persian names', () => {
    const agents = listDepartmentAgents();
    expect(agents.length).toBeGreaterThanOrEqual(8);
    expect(agents.find((a) => a.type === 'CEO')?.name).toBe('مدیرعامل');
    expect(agents.find((a) => a.type === 'SALES')?.tools?.length).toBeGreaterThan(0);
  });

  it('has distinct prompts per department', () => {
    const prompts = Object.values(DEPARTMENT_PROMPTS).map((p) => p.systemPrompt);
    expect(new Set(prompts).size).toBe(prompts.length);
  });
});
