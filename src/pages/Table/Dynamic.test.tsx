import React from 'react';
import { render } from '@testing-library/react';
import DynamicSelectList from "./DynamicSelectList";
test('test common matcher', () => {
    expect(3+2).toBe(5);
    expect(2+2).not.toBe(5);
    expect(1).toBeTruthy();
    expect(0).toBeFalsy();
    expect(4).toBeGreaterThan(3);
    expect(2).toBeLessThan(3);
    expect({name: 'rose'}).toEqual({name: 'rose'});
    // const wrapper = render(<DynamicSelectList form={undefined} label={''} name={''} selectConfigs={[]} />);
})
